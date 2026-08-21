package com.cakebusiness.service;

import com.cakebusiness.dto.ContactRequest;
import com.cakebusiness.entity.Contact;
import com.cakebusiness.repository.ContactRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public Contact create(ContactRequest request) {

        Contact contact = new Contact();

        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setSubject(request.getSubject());
        contact.setMessage(request.getMessage());

        contact.setStatus("NEW");

        return contactRepository.save(contact);
    }

    public List<Contact> getAll() {
        return contactRepository.findAll();
    }

    public Contact getById(Long id) {

        return contactRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contact not found"));
    }

    public List<Contact> getByStatus(String status) {
        return contactRepository.findByStatus(status);
    }

    public Contact updateStatus(Long id, String status) {

        Contact contact = getById(id);

        contact.setStatus(status);

        return contactRepository.save(contact);
    }

    public void delete(Long id) {

        if (!contactRepository.existsById(id)) {
            throw new RuntimeException("Contact not found");
        }

        contactRepository.deleteById(id);
    }
}