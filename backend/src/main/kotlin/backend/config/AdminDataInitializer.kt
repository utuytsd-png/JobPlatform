package backend.config

import backend.model.User
import backend.model.UserRole
import backend.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class AdminDataInitializer(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    @Value("\${admin.default.email:admin@example.com}") private val adminEmail: String,
    @Value("\${admin.default.password:admin123}") private val adminPassword: String,
    @Value("\${admin.default.first-name:Admin}") private val adminFirstName: String,
    @Value("\${admin.default.last-name:User}") private val adminLastName: String,
) : ApplicationRunner {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun run(args: ApplicationArguments) {
        if (userRepository.existsByEmail(adminEmail)) {
            logger.info("Default admin already exists: {}", adminEmail)
            return
        }

        val admin = User(
            email = adminEmail,
            password = passwordEncoder.encode(adminPassword),
            firstName = adminFirstName,
            lastName = adminLastName,
            role = UserRole.ADMIN
        )

        userRepository.save(admin)
        logger.info("Seeded default admin user: {}", adminEmail)
    }
}
