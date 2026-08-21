package com.cakebusiness.repository;

import com.cakebusiness.entity.SpecialOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SpecialOfferRepository
        extends JpaRepository<SpecialOffer, Long> {

    List<SpecialOffer> findByActiveTrue();

    List<SpecialOffer> findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate startDate,
            LocalDate endDate
    );
}