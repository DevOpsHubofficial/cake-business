package com.cakebusiness.service;

import com.cakebusiness.dto.SpecialOfferRequest;
import com.cakebusiness.entity.SpecialOffer;
import com.cakebusiness.repository.SpecialOfferRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SpecialOfferService {

    private final SpecialOfferRepository specialOfferRepository;

    public SpecialOfferService(
            SpecialOfferRepository specialOfferRepository) {

        this.specialOfferRepository = specialOfferRepository;
    }

    public SpecialOffer create(SpecialOfferRequest request) {

        validateDates(request);

        SpecialOffer offer = new SpecialOffer();

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setDiscountType(request.getDiscountType());
        offer.setDiscountValue(request.getDiscountValue());
        offer.setStartDate(request.getStartDate());
        offer.setEndDate(request.getEndDate());

        if (request.getActive() == null) {
            offer.setActive(true);
        } else {
            offer.setActive(request.getActive());
        }

        offer.setImageUrl(request.getImageUrl());

        return specialOfferRepository.save(offer);
    }

    public List<SpecialOffer> getAll() {
        return specialOfferRepository.findAll();
    }

    public SpecialOffer getById(Long id) {

        return specialOfferRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Special offer not found"));
    }

    public SpecialOffer update(
            Long id,
            SpecialOfferRequest request) {

        SpecialOffer offer = getById(id);

        validateDates(request);

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setDiscountType(request.getDiscountType());
        offer.setDiscountValue(request.getDiscountValue());
        offer.setStartDate(request.getStartDate());
        offer.setEndDate(request.getEndDate());

        if (request.getActive() == null) {
            offer.setActive(true);
        } else {
            offer.setActive(request.getActive());
        }

        offer.setImageUrl(request.getImageUrl());

        return specialOfferRepository.save(offer);
    }

    public void delete(Long id) {

        if (!specialOfferRepository.existsById(id)) {
            throw new RuntimeException(
                    "Special offer not found");
        }

        specialOfferRepository.deleteById(id);
    }

    public List<SpecialOffer> getActiveOffers() {

        LocalDate today = LocalDate.now();

        return specialOfferRepository
                .findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        today,
                        today
                );
    }

    private void validateDates(SpecialOfferRequest request) {

        if (request.getStartDate() == null) {
            throw new RuntimeException(
                    "Start date is required");
        }

        if (request.getEndDate() == null) {
            throw new RuntimeException(
                    "End date is required");
        }

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date");
        }
    }
}