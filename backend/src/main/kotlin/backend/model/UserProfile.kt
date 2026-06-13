package backend.model

import jakarta.persistence.*

@Entity
@Table(name = "user_profiles")
data class UserProfile(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    val user: User,

    var skills: String = "",           // "Kotlin, Java, Spring"
    var experience: String = "",       // текст досвіду
    var education: String = "",        // текст освіти
    var resumeText: String = "",        // короткий опис себе
    @Column(name = "resume_file_path")
    var resumeFilePath: String? = null
)