package backend.controller

import backend.model.UserRole
import backend.repository.JobVacancyRepository
import backend.repository.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val userRepository: UserRepository,
    private val vacancyRepository: JobVacancyRepository,
    private val applicationRepository: backend.repository.JobApplicationRepository,
    private val savedVacancyRepository: backend.repository.SavedVacancyRepository
) {
    // Перевірка що юзер — адмін
    private fun checkAdmin(auth: Authentication) {
        if (!auth.authorities.any { it.authority == "ROLE_ADMIN" }) {
            throw RuntimeException("Доступ заборонено")
        }
    }

    // Всі користувачі
    @GetMapping("/users")
    fun getAllUsers(auth: Authentication): ResponseEntity<Any> {
        checkAdmin(auth)
        val users = userRepository.findAll().map {
            mapOf(
                "id" to it.id,
                "email" to it.email,
                "firstName" to it.firstName,
                "lastName" to it.lastName,
                "role" to it.role.name
            )
        }
        return ResponseEntity.ok(users)
    }

    // Видалити користувача
    @DeleteMapping("/users/{id}")
    fun deleteUser(@PathVariable id: Long, auth: Authentication): ResponseEntity<Any> {
        checkAdmin(auth)
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Користувача не знайдено"))
        }
        userRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "Видалено"))
    }

    // Всі вакансії
    @GetMapping("/vacancies")
    fun getAllVacancies(auth: Authentication): ResponseEntity<Any> {
        checkAdmin(auth)
        val vacancies = vacancyRepository.findAll().map {
            mapOf(
                "id" to it.id,
                "title" to it.title,
                "company" to it.company,
                "location" to it.location,
                "employerEmail" to it.employer.email,
                "createdAt" to it.createdAt.toString()
            )
        }
        return ResponseEntity.ok(vacancies)
    }

    // Видалити вакансію
    @DeleteMapping("/vacancies/{id}")
    fun deleteVacancy(@PathVariable id: Long, auth: Authentication): ResponseEntity<Any> {
        checkAdmin(auth)
        if (!vacancyRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Вакансію не знайдено"))
        }
        
        // Видаляємо всі відгуки на цю вакансію, щоб не було конфлікту зовнішнього ключа
        val applications = applicationRepository.findAll().filter { it.vacancy.id == id }
        applicationRepository.deleteAll(applications)
        
        // Видаляємо всі збережені вакансії (закладки) користувачів
        val saved = savedVacancyRepository.findAll().filter { it.vacancy.id == id }
        savedVacancyRepository.deleteAll(saved)
        
        vacancyRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "Видалено"))
    }

    // Статистика
    @GetMapping("/stats")
    fun getStats(auth: Authentication): ResponseEntity<Any> {
        checkAdmin(auth)
        return ResponseEntity.ok(mapOf(
            "totalUsers" to userRepository.count(),
            "totalVacancies" to vacancyRepository.count(),
            "jobSeekers" to userRepository.findAllByRole(UserRole.JOB_SEEKER).size,
            "employers" to userRepository.findAllByRole(UserRole.EMPLOYER).size
        ))
    }

    // Змінити роль користувача
    @PutMapping("/users/{id}/role")
    fun updateUserRole(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>,
        auth: Authentication
    ): ResponseEntity<Any> {
        checkAdmin(auth)
        val user = userRepository.findById(id).orElse(null)
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Користувача не знайдено"))
        
        val newRole = request["role"] ?: return ResponseEntity.badRequest().body(mapOf("error" to "Роль не вказана"))
        
        try {
            user.role = UserRole.valueOf(newRole)
            userRepository.save(user)
            return ResponseEntity.ok(mapOf(
                "message" to "Роль оновлено",
                "newRole" to user.role.name
            ))
        } catch (e: Exception) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Невірна роль"))
        }
    }

    // Всі заявки
    @GetMapping("/applications")
    fun getAllApplications(auth: Authentication): ResponseEntity<Any> {
        checkAdmin(auth)
        val apps = applicationRepository.findAll().map {
            mapOf(
                "id" to it.id,
                "vacancyTitle" to it.vacancy.title,
                "vacancyCompany" to it.vacancy.company,
                "applicantEmail" to it.applicant.email,
                "applicantName" to "${it.applicant.firstName} ${it.applicant.lastName}".trim(),
                "status" to it.status.name,
                "appliedAt" to it.appliedAt.toString()
            )
        }
        return ResponseEntity.ok(apps)
    }
}