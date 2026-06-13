package backend.controller

import backend.dto.UpdateProfileRequest
import backend.service.ProfileService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profile")
class ProfileController(private val profileService: ProfileService) {

    @GetMapping
    fun getProfile(authentication: Authentication): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(profileService.getProfile(authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @PutMapping
    fun updateProfile(
        @RequestBody request: UpdateProfileRequest,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(profileService.updateProfile(authentication.name, request))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @PostMapping("/resume/file")
    fun uploadResumeFile(@RequestParam("file") file: org.springframework.web.multipart.MultipartFile, authentication: Authentication): ResponseEntity<Any> {
        return try {
            profileService.uploadResumeFile(authentication.name, file)
            ResponseEntity.ok(mapOf("message" to "Файл завантажено"))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/resume/file")
    fun getResumeFile(authentication: Authentication): ResponseEntity<org.springframework.core.io.Resource> {
        return try {
            val file = profileService.getResumeFile(authentication.name)
            ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"${file.filename}\"")
                .body(file)
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/resume/file/{userId}")
    fun getCandidateResumeFile(@PathVariable userId: Long): ResponseEntity<org.springframework.core.io.Resource> {
        return try {
            val file = profileService.getResumeFileByUserId(userId)
            ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"${file.filename}\"")
                .body(file)
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/resume/file")
    fun deleteResumeFile(authentication: Authentication): ResponseEntity<Any> {
        return try {
            profileService.deleteResumeFile(authentication.name)
            ResponseEntity.ok(mapOf("message" to "Файл успішно видалено"))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
}