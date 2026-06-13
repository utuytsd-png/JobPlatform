package backend.repository

import backend.model.JobVacancy
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param



interface JobVacancyRepository : JpaRepository<JobVacancy, Long> {
    fun findAllByIsActiveTrue(): List<JobVacancy>
    fun findAllByTitleContainingIgnoreCase(title: String): List<JobVacancy>
    fun findByEmployerEmail(email: String): List<JobVacancy>

    @Query("""
        SELECT v FROM JobVacancy v WHERE v.isActive = true
        AND (:query = '' OR LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.company) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.requiredSkills) LIKE LOWER(CONCAT('%', :query, '%')))
        AND (:location = '' OR LOWER(v.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:employmentType = 'Всі' OR :employmentType = '' OR v.employmentType = :employmentType)
    """)
    fun findWithFilters(
        @Param("query") query: String,
        @Param("location") location: String,
        @Param("employmentType") employmentType: String
    ): List<JobVacancy>
}

