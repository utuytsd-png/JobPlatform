package backend.controller

import backend.dto.CreateVacancyRequest
import backend.service.VacancyService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/vacancies")
class VacancyController(private val vacancyService: VacancyService) {

    @GetMapping
    fun getAllVacancies(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) employmentType: String?
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(vacancyService.getAllVacancies(query, location, employmentType))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/{id}")
    fun getVacancyById(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(vacancyService.getVacancyById(id))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/search")
    fun searchVacancies(@RequestParam query: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(vacancyService.searchVacancies(query))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @PostMapping
    fun createVacancy(
        @RequestBody request: CreateVacancyRequest,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(vacancyService.createVacancy(request, authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
    @PutMapping("/{id}")
    fun updateVacancy(
        @PathVariable id: Long,
        @RequestBody request: CreateVacancyRequest,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(vacancyService.updateVacancy(id, request, authentication.name))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
    @GetMapping("/filter")
    fun filterVacancies(
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) employmentType: String?
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(vacancyService.filterVacancies(location, employmentType))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @DeleteMapping("/{id}")
    fun deleteVacancy(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Any> {
        return try {
            vacancyService.deleteVacancy(id, authentication.name)
            ResponseEntity.ok(mapOf("message" to "Вакансію видалено"))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
}