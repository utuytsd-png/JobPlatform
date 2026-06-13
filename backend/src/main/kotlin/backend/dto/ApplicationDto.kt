package backend.dto

import java.time.LocalDateTime

data class CreateApplicationRequest(
    val vacancyId: Long,
    val coverLetter: String
)

data class ApplicationResponse(
    val id: Long,
    val vacancyTitle: String,
    val vacancyCompany: String,
    val applicantId: Long,
    val applicantFirstName: String,
    val applicantLastName: String,
    val applicantEmail: String,
    val coverLetter: String,
    val status: String,
    val appliedAt: LocalDateTime
)