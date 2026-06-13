package backend.controller

import backend.dto.CreateApplicationRequest
import backend.service.ApplicationService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/applications")
class ApplicationController(private val applicationService: ApplicationService) {

    @PostMapping
    fun apply(
        @RequestBody request: CreateApplicationRequest,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(applicationService.apply(request, authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/my")
    fun getMyApplications(authentication: Authentication): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(applicationService.getMyApplications(authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @PutMapping("/{id}/status")
    fun updateStatus(
        @PathVariable id: Long,
        @RequestBody body: Map<String, String>,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(applicationService.updateStatus(id, body["status"]!!, authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/vacancy/{vacancyId}")
    fun getVacancyApplications(
        @PathVariable vacancyId: Long,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(applicationService.getVacancyApplications(vacancyId, authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
}