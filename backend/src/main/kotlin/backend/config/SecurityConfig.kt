package backend.config

import backend.service.JwtService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtFilter: JwtAuthFilter,
    @Value("\${app.cors.allowed-origins}") private val allowedOrigins: String
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers("/api/auth/**").permitAll()
                auth.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vacancies", "/api/vacancies/**").permitAll()

                auth.requestMatchers("/api/recommendations/**").hasRole("JOB_SEEKER")
                auth.requestMatchers(org.springframework.http.HttpMethod.POST, "/api/applications").hasRole("JOB_SEEKER")
                auth.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/applications/my").hasRole("JOB_SEEKER")

                auth.requestMatchers(org.springframework.http.HttpMethod.POST, "/api/vacancies").hasRole("EMPLOYER")
                auth.requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/vacancies/**").hasRole("EMPLOYER")
                auth.requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/vacancies/**").hasRole("EMPLOYER")
                auth.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/applications/vacancy/**").hasRole("EMPLOYER")
                auth.requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/applications/*/status").hasRole("EMPLOYER")

                auth.requestMatchers("/api/profile/**").hasAnyRole("JOB_SEEKER", "EMPLOYER")

                auth.requestMatchers("/api/admin/**").hasRole("ADMIN")

                auth.anyRequest().authenticated()
            }
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration()
        val origins = allowedOrigins.split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }

        if (origins.contains("*")) {
            config.addAllowedOriginPattern("*")
        } else {
            config.allowedOrigins = origins
        }

        config.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        config.allowedHeaders = listOf("*")
        config.exposedHeaders = listOf("Content-Disposition")
        config.allowCredentials = true
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return source
    }
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}

@Component
class JwtAuthFilter(private val jwtService: JwtService) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.substring(7)

        if (jwtService.isTokenValid(token)) {
            val email = jwtService.extractEmail(token)
            val role = jwtService.extractRole(token)

            val auth = org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                email, null,
                listOf(org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_$role"))
            )
            org.springframework.security.core.context.SecurityContextHolder
                .getContext().authentication = auth
        }

        filterChain.doFilter(request, response)
    }
}
