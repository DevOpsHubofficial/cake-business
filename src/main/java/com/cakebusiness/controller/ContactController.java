package com.cakebusiness.controller;

import com.cakebusiness.dto.ContactRequest;
import com.cakebusiness.entity.Contact;
import com.cakebusiness.service.ContactService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Contact create(
            @Valid @RequestBody ContactRequest request ) {

        return contactService.create(request);
    }

    @GetMapping
    public List<Contact> getAll() {

        return contactService.getAll();
    }

    @GetMapping("/{id}")
    public Contact getById(
            @PathVariable Long id) {

        return contactService.getById(id);
    }

    @GetMapping("/status/{status}")
    public List<Contact> getByStatus(
            @PathVariable String status) {

        return contactService.getByStatus(status);
    }

    @PutMapping("/{id}/status")
    public Contact updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return contactService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id) {

        contactService.delete(id);
    }
}