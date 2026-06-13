package backend.repository

import backend.model.UserProfile
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserProfileRepository : JpaRepository<UserProfile, Long> {
    fun findByUserId(userId: Long): Optional<UserProfile>
}