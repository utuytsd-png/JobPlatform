package backend.dto

import java.time.LocalDateTime

data class CreateVacancyRequest(
    val title: String,
    val description: String,
    val company: String,
    val location: String,
    val salary: String = "",
    val employmentType: String = "",
    val requiredSkills: String = ""
)

data class VacancyResponse(
    val id: Long,
    val title: String,
    val description: String,
    val company: String,
    val location: String,
    val salary: String,
    val requiredSkills: String,
    val employerFirstName: String,
    val employerLastName: String,
    val employerEmail: String,
    val createdAt: LocalDateTime,
    val isActive: Boolean,
    val employmentType: String
)