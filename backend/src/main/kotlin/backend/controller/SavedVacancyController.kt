package backend.controller

import backend.dto.VacancyResponse
import backend.model.SavedVacancy
import backend.repository.JobVacancyRepository
import backend.repository.SavedVacancyRepository
import backend.repository.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/saved-vacancies")
class SavedVacancyController(
    private val savedVacancyRepository: SavedVacancyRepository,
    private val vacancyRepository: JobVacancyRepository,
    private val userRepository: UserRepository
) {
    @GetMapping
    fun getSavedVacancies(auth: Authentication): ResponseEntity<Any> {
        val email = auth.name
        val saved = savedVacancyRepository.findAllByUserEmail(email)
        val responses = saved.map { sv ->
            val v = sv.vacancy
            VacancyResponse(
                id = v.id,
                title = v.title,
                description = v.description,
                company = v.company,
                location = v.location,
                salary = v.salary ?: "",
                requiredSkills = v.requiredSkills ?: "",
                employerFirstName = v.employer.firstName,
                employerLastName = v.employer.lastName,
                employerEmail = v.employer.email,
                createdAt = v.createdAt,
                isActive = v.isActive,
                employmentType = v.employmentType ?: ""
            )
        }
        return ResponseEntity.ok(responses)
    }

    @PostMapping("/{vacancyId}")
    @Transactional
    fun toggleSavedVacancy(@PathVariable vacancyId: Long, auth: Authentication): ResponseEntity<Any> {
        val email = auth.name
        val exists = savedVacancyRepository.existsByUserEmailAndVacancyId(email, vacancyId)
        if (exists) {
            savedVacancyRepository.deleteByUserEmailAndVacancyId(email, vacancyId)
            return ResponseEntity.ok(mapOf("saved" to false))
        } else {
            val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("Користувача не знайдено") }
            val vacancy = vacancyRepository.findById(vacancyId).orElseThrow { RuntimeException("Вакансію не знайдено") }
            savedVacancyRepository.save(SavedVacancy(user = user, vacancy = vacancy))
            return ResponseEntity.ok(mapOf("saved" to true))
        }
    }

    @GetMapping("/{vacancyId}/check")
    fun checkSaved(@PathVariable vacancyId: Long, auth: Authentication): ResponseEntity<Any> {
        val email = auth.name
        val exists = savedVacancyRepository.existsByUserEmailAndVacancyId(email, vacancyId)
        return ResponseEntity.ok(mapOf("saved" to exists))
    }
}
