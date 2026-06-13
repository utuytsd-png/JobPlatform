package backend.service

import backend.dto.UpdateProfileRequest
import backend.dto.UserProfileResponse
import backend.model.UserProfile
import backend.repository.UserProfileRepository
import backend.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

@Service
class ProfileService(
    private val userRepository: UserRepository,
    private val profileRepository: UserProfileRepository
) {
    fun getProfile(email: String): UserProfileResponse {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("Користувача не знайдено") }

        val profile = profileRepository.findByUserId(user.id)
            .orElse(UserProfile(user = user))

        return UserProfileResponse(
            userId = user.id,
            firstName = user.firstName,
            lastName = user.lastName,
            email = user.email,
            role = user.role.name,
            skills = profile.skills,
            experience = profile.experience,
            education = profile.education,
            resumeText = profile.resumeText,
            resumeFilePath = profile.resumeFilePath
        )
    }

    @Transactional
    fun updateProfile(email: String, request: UpdateProfileRequest): UserProfileResponse {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("Користувача не знайдено") }

        user.firstName = request.firstName
        user.lastName = request.lastName
        userRepository.save(user)

        val profile = profileRepository.findByUserId(user.id)
            .orElse(UserProfile(user = user))

        profile.skills = request.skills
        profile.experience = request.experience
        profile.education = request.education
        profile.resumeText = request.resumeText
        profileRepository.save(profile)

        return getProfile(email)
    }

    fun uploadResumeFile(email: String, file: MultipartFile) {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("Користувача не знайдено") }
        val profile = profileRepository.findByUserId(user.id).orElse(UserProfile(user = user))
        
        val uploadDir = Paths.get("uploads/resumes")
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir)
        }
        
        val ext = file.originalFilename?.substringAfterLast(".", "pdf") ?: "pdf"
        val fileName = "${user.id}_resume.$ext"
        val path = uploadDir.resolve(fileName)
        
        Files.copy(file.inputStream, path, StandardCopyOption.REPLACE_EXISTING)
        
        profile.resumeFilePath = fileName
        profileRepository.save(profile)
    }

    fun getResumeFile(email: String): Resource {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("Користувача не знайдено") }
        val profile = profileRepository.findByUserId(user.id).orElseThrow { RuntimeException("Профіль не знайдено") }
        val fileName = profile.resumeFilePath ?: throw RuntimeException("Файл резюме не завантажено")
        
        val path = Paths.get("uploads/resumes").resolve(fileName)
        val resource = UrlResource(path.toUri())
        if (!resource.exists() || !resource.isReadable) {
            throw RuntimeException("Не вдалося прочитати файл")
        }
        return resource
    }

    fun getResumeFileByUserId(userId: Long): Resource {
        val user = userRepository.findById(userId).orElseThrow { RuntimeException("Користувача не знайдено") }
        val profile = profileRepository.findByUserId(user.id).orElseThrow { RuntimeException("Профіль не знайдено") }
        val fileName = profile.resumeFilePath ?: throw RuntimeException("Файл резюме не завантажено")
        
        val path = Paths.get("uploads/resumes").resolve(fileName)
        val resource = UrlResource(path.toUri())
        if (!resource.exists() || !resource.isReadable) {
            throw RuntimeException("Не вдалося прочитати файл")
        }
        return resource
    }

    fun deleteResumeFile(email: String) {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("Користувача не знайдено") }
        val profile = profileRepository.findByUserId(user.id).orElseThrow { RuntimeException("Профіль не знайдено") }
        
        val fileName = profile.resumeFilePath ?: throw RuntimeException("Файл резюме не знайдено")
        val path = java.nio.file.Paths.get("uploads/resumes").resolve(fileName)
        java.nio.file.Files.deleteIfExists(path)
        
        profile.resumeFilePath = null
        profileRepository.save(profile)
    }
}