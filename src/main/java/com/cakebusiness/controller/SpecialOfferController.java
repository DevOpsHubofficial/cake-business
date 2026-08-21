package com.cakebusiness.controller;

import com.cakebusiness.dto.SpecialOfferRequest;
import com.cakebusiness.entity.SpecialOffer;
import com.cakebusiness.service.SpecialOfferService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/special-offers")
public class SpecialOfferController {

    private final SpecialOfferService specialOfferService;

    public SpecialOfferController(
            SpecialOfferService specialOfferService) {

        this.specialOfferService = specialOfferService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpecialOffer create(
        @Valid @RequestBody SpecialOfferRequest request) {

    return specialOfferService.create(request);
    }

    @GetMapping
    public List<SpecialOffer> getAll() {

        return specialOfferService.getAll();
    }

    @GetMapping("/{id}")
    public SpecialOffer getById(
            @PathVariable Long id) {

        return specialOfferService.getById(id);
    }

    @PutMapping("/{id}")
    public SpecialOffer update(
        @PathVariable Long id,
        @Valid @RequestBody SpecialOfferRequest request) {

    return specialOfferService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id) {

        specialOfferService.delete(id);
    }

    @GetMapping("/active")
    public List<SpecialOffer> getActiveOffers() {

        return specialOfferService.getActiveOffers();
    }
}