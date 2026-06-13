package backend.service

import backend.dto.AuthResponse
import backend.dto.LoginRequest
import backend.dto.RegisterRequest
import backend.model.User
import backend.model.UserRole
import backend.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {
    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw RuntimeException("Email вже використовується")
        }

        val user = User(
            email = request.email,
            password = passwordEncoder.encode(request.password),
            firstName = request.firstName,
            lastName = request.lastName,
            role = UserRole.valueOf(request.role)
        )

        userRepository.save(user)

        val token = jwtService.generateToken(user.email, user.role.name)
        return AuthResponse(token, user.email, user.firstName, user.lastName, user.role.name)
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { RuntimeException("Користувача не знайдено") }

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw RuntimeException("Невірний пароль")
        }

        val token = jwtService.generateToken(user.email, user.role.name)
        return AuthResponse(token, user.email, user.firstName, user.lastName, user.role.name)
    }
}