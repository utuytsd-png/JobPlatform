package backend.repository

import backend.model.JobApplication
import org.springframework.data.jpa.repository.JpaRepository

interface JobApplicationRepository : JpaRepository<JobApplication, Long> {
    fun findAllByApplicantId(applicantId: Long): List<JobApplication>
    fun findAllByVacancyId(vacancyId: Long): List<JobApplication>
    fun existsByVacancyIdAndApplicantId(vacancyId: Long, applicantId: Long): Boolean
    fun deleteAllByVacancyId(vacancyId: Long)
}
