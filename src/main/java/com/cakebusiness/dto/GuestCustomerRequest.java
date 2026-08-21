package com.cakebusiness.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class GuestCustomerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    private String phone;

    private String address;

    public GuestCustomerRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
