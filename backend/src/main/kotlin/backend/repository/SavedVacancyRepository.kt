package backend.repository

import backend.model.SavedVacancy
import org.springframework.data.jpa.repository.JpaRepository

interface SavedVacancyRepository : JpaRepository<SavedVacancy, Long> {
    fun findAllByUserEmail(email: String): List<SavedVacancy>
    fun findByUserEmailAndVacancyId(email: String, vacancyId: Long): SavedVacancy?
    fun deleteByUserEmailAndVacancyId(email: String, vacancyId: Long)
    fun existsByUserEmailAndVacancyId(email: String, vacancyId: Long): Boolean
}
