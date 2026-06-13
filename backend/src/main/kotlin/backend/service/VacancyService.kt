package backend.service

import backend.dto.CreateVacancyRequest
import backend.dto.VacancyResponse
import backend.model.JobVacancy
import backend.repository.JobApplicationRepository
import backend.repository.JobVacancyRepository
import backend.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class VacancyService(
    private val vacancyRepository: JobVacancyRepository,
    private val userRepository: UserRepository,
    private val applicationRepository: JobApplicationRepository
) {
    fun getAllVacancies(query: String?, location: String?, employmentType: String?): List<VacancyResponse> {
        return vacancyRepository.findWithFilters(
            query = query ?: "",
            location = location ?: "",
            employmentType = employmentType ?: ""
        ).map { it.toResponse() }
    }

    fun getVacancyById(id: Long): VacancyResponse {
        val vacancy = vacancyRepository.findById(id)
            .orElseThrow { RuntimeException("Вакансію не знайдено") }
        return vacancy.toResponse()
    }

    fun createVacancy(request: CreateVacancyRequest, employerEmail: String): VacancyResponse {
        val employer = userRepository.findByEmail(employerEmail)
            .orElseThrow { RuntimeException("Користувача не знайдено") }

        val vacancy = JobVacancy(
            title = request.title,
            description = request.description,
            company = request.company,
            location = request.location,
            salary = request.salary,
            requiredSkills = request.requiredSkills,
            employer = employer,
            employmentType = request.employmentType
        )

        return vacancyRepository.save(vacancy).toResponse()
    }

    @Transactional
    fun deleteVacancy(id: Long, employerEmail: String) {
        val vacancy = vacancyRepository.findById(id)
            .orElseThrow { RuntimeException("Вакансію не знайдено") }

        if (vacancy.employer.email != employerEmail) {
            throw RuntimeException("Немає доступу")
        }

        applicationRepository.deleteAllByVacancyId(id)
        vacancyRepository.delete(vacancy)
    }

    fun searchVacancies(query: String): List<VacancyResponse> {
        return vacancyRepository.findAllByTitleContainingIgnoreCase(query).map { it.toResponse() }
    }

    fun updateVacancy(id: Long, request: CreateVacancyRequest, employerEmail: String): VacancyResponse {
        val vacancy = vacancyRepository.findById(id)
            .orElseThrow { RuntimeException("Вакансію не знайдено") }

        if (vacancy.employer.email != employerEmail) {
            throw RuntimeException("Немає доступу")
        }

        vacancy.title = request.title
        vacancy.description = request.description
        vacancy.company = request.company
        vacancy.location = request.location
        vacancy.salary = request.salary
        vacancy.employmentType = request.employmentType
        vacancy.requiredSkills = request.requiredSkills

        return vacancyRepository.save(vacancy).toResponse()
    }

    fun filterVacancies(location: String?, employmentType: String?): List<VacancyResponse> {
        return vacancyRepository.findWithFilters(
            query = "",
            location = location ?: "",
            employmentType = employmentType ?: ""
        ).map { it.toResponse() }
    }

    private fun JobVacancy.toResponse() = VacancyResponse(
        id = id,
        title = title,
        description = description,
        company = company,
        location = location,
        // ДОБАВЛЯЕМ ?: "" ЗДЕСЬ
        salary = salary ?: "",
        requiredSkills = requiredSkills ?: "",
        employerFirstName = employer.firstName,
        employerLastName = employer.lastName,
        employerEmail = employer.email,
        createdAt = createdAt,
        isActive = isActive,
        // И ЗДЕСЬ
        employmentType = employmentType ?: ""
    )
}