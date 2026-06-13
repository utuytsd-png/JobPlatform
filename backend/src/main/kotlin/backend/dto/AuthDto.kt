package backend.dto

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val role: String = "JOB_SEEKER"
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String
)

data class UserProfileResponse(
    val userId: Long,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String,
    val skills: String,
    val experience: String,
    val education: String,
    val resumeText: String,
    val resumeFilePath: String? = null
)

data class UpdateProfileRequest(
    val firstName: String,
    val lastName: String,
    val skills: String,
    val experience: String,
    val education: String,
    val resumeText: String
)