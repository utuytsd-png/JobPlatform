package backend.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "saved_vacancies")
data class SavedVacancy(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    val vacancy: JobVacancy,

    @Column(nullable = false)
    val savedAt: LocalDateTime = LocalDateTime.now()
)
