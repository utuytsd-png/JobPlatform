package backend.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "job_vacancies")
data class JobVacancy(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false)
    var title: String = "",

    @Column(nullable = false, length = 5000)
    var description: String = "",

    @Column(nullable = false)
    var company: String = "",

    @Column(nullable = false)
    var location: String = "",

    var salary: String? = "",

    // Добавили ?
    var requiredSkills: String? = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    var employer: User = User(),

    @Column(nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var isActive: Boolean = true,

    // Добавили ?
    var employmentType: String? = ""
)