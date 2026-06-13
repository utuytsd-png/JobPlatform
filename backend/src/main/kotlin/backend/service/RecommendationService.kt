package backend.service

import backend.repository.JobVacancyRepository
import backend.repository.UserProfileRepository
import backend.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class RecommendationService(
    private val userRepository: UserRepository,
    private val profileRepository: UserProfileRepository,
    private val vacancyRepository: JobVacancyRepository
) {
    fun getRecommendations(email: String): List<RecommendedVacancy> {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("Користувача не знайдено") }

        val profile = profileRepository.findByUserId(user.id)
            .orElse(null)

        val skillsRaw = profile?.skills ?: ""
        if (skillsRaw.isBlank()) {
            return emptyList()
        }

        val userSkills = skillsRaw
            .split(",")
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }
            .toSet()

        val vacancies = vacancyRepository.findAllByIsActiveTrue()

        return vacancies
            .map { vacancy ->
                val vacancySkills = (vacancy.requiredSkills ?: "")
                    .split(",")
                    .map { it.trim().lowercase() }
                    .filter { it.isNotEmpty() }
                    .toSet()

                val matchedSkills = userSkills.intersect(vacancySkills).toList()

                val score = if (vacancySkills.isEmpty()) 0
                else (matchedSkills.size * 100) / vacancySkills.size

                RecommendedVacancy(
                    id = vacancy.id,
                    title = vacancy.title,
                    company = vacancy.company,
                    location = vacancy.location,
                    salary = vacancy.salary ?: "",
                    employmentType = vacancy.employmentType ?: "",
                    description = vacancy.description,
                    employerFirstName = vacancy.employer.firstName,
                    employerLastName = vacancy.employer.lastName,
                    employerEmail = vacancy.employer.email,
                    createdAt = vacancy.createdAt.toString(),
                    matchScore = score,
                    matchedSkills = matchedSkills
                )
            }
            .filter { it.matchScore > 0 }
            .sortedByDescending { it.matchScore }
    }
}

data class RecommendedVacancy(
    val id: Long,
    val title: String,
    val company: String,
    val location: String,
    val salary: String,
    val employmentType: String,
    val description: String,
    val employerFirstName: String,
    val employerLastName: String,
    val employerEmail: String,
    val createdAt: String,
    val matchScore: Int,
    val matchedSkills: List<String>
)