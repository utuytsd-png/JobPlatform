package backend.service

import backend.dto.ApplicationResponse
import backend.dto.CreateApplicationRequest
import backend.model.JobApplication
import backend.repository.JobApplicationRepository
import backend.repository.JobVacancyRepository
import backend.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class ApplicationService(
    private val applicationRepository: JobApplicationRepository,
    private val vacancyRepository: JobVacancyRepository,
    private val userRepository: UserRepository
) {
    fun apply(request: CreateApplicationRequest, applicantEmail: String): ApplicationResponse {
        val applicant = userRepository.findByEmail(applicantEmail)
            .orElseThrow { RuntimeException("Користувача не знайдено") }

        val vacancy = vacancyRepository.findById(request.vacancyId)
            .orElseThrow { RuntimeException("Вакансію не знайдено") }

        if (applicationRepository.existsByVacancyIdAndApplicantId(vacancy.id, applicant.id)) {
            throw RuntimeException("Ви вже відгукнулись на цю вакансію")
        }

        val application = JobApplication(
            vacancy = vacancy,
            applicant = applicant,
            coverLetter = request.coverLetter
        )

        return applicationRepository.save(application).toResponse()
    }

    fun getMyApplications(applicantEmail: String): List<ApplicationResponse> {
        val applicant = userRepository.findByEmail(applicantEmail)
            .orElseThrow { RuntimeException("Користувача не знайдено") }
        return applicationRepository.findAllByApplicantId(applicant.id).map { it.toResponse() }
    }

    fun getVacancyApplications(vacancyId: Long, employerEmail: String): List<ApplicationResponse> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { RuntimeException("Вакансію не знайдено") }

        if (vacancy.employer.email != employerEmail) {
            throw RuntimeException("Немає доступу")
        }

        return applicationRepository.findAllByVacancyId(vacancyId).map { it.toResponse() }
    }

    fun updateStatus(applicationId: Long, status: String, employerEmail: String): ApplicationResponse {
        val application = applicationRepository.findById(applicationId)
            .orElseThrow { RuntimeException("Заявку не знайдено") }

        if (application.vacancy.employer.email != employerEmail) {
            throw RuntimeException("Немає доступу")
        }

        application.status = backend.model.ApplicationStatus.valueOf(status)
        return applicationRepository.save(application).toResponse()
    }

    private fun JobApplication.toResponse() = ApplicationResponse(
        id = id,
        vacancyTitle = vacancy.title,
        vacancyCompany = vacancy.company,
        applicantId = applicant.id,
        applicantFirstName = applicant.firstName,
        applicantLastName = applicant.lastName,
        applicantEmail = applicant.email,
        coverLetter = coverLetter,
        status = status.name,
        appliedAt = appliedAt
    )
}
