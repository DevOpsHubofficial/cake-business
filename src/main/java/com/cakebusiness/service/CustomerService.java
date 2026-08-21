package com.cakebusiness.service;

import com.cakebusiness.dto.GuestCustomerRequest;
import com.cakebusiness.entity.Customer;
import com.cakebusiness.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + id
                        ));
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(
            Long id,
            Customer updatedCustomer) {

        Customer existingCustomer = getCustomerById(id);

        existingCustomer.setName(updatedCustomer.getName());
        existingCustomer.setEmail(updatedCustomer.getEmail());
        existingCustomer.setPhone(updatedCustomer.getPhone());
        existingCustomer.setAddress(updatedCustomer.getAddress());
        existingCustomer.setCity(updatedCustomer.getCity());
        existingCustomer.setState(updatedCustomer.getState());
        existingCustomer.setPostalCode(
                updatedCustomer.getPostalCode()
        );

        return customerRepository.save(existingCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);

        customerRepository.delete(customer);
    }

    /**
     * Find an existing customer by phone number or create a new one.
     * Safe to call on every checkout without duplicating records.
     */
    @Transactional
    public Customer findOrCreateByPhone(GuestCustomerRequest request) {

        return customerRepository
                .findByPhone(request.getPhone().trim())
                .map(existing -> {
                    // Update name/address in case they changed
                    existing.setName(request.getName().trim());
                    if (request.getAddress() != null && !request.getAddress().isBlank()) {
                        existing.setAddress(request.getAddress().trim());
                    }
                    return customerRepository.save(existing);
                })
                .orElseGet(() -> {
                    Customer customer = new Customer();
                    customer.setName(request.getName().trim());
                    customer.setPhone(request.getPhone().trim());
                    if (request.getAddress() != null) {
                        customer.setAddress(request.getAddress().trim());
                    }
                    return customerRepository.save(customer);
                });
    }
}