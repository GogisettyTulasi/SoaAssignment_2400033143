package com.klef.soa.docker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PackageRequest {

    @NotBlank(message = "Tracking code is required")
    @Pattern(regexp = "^[0-9]{5}$", message = "Tracking code must not exceed 50 characters")
    private String trackingCode;

    @NotBlank(message = "Current location is required")
    @Size(max = 100, message = "Current location must not exceed 100 characters")
    private String currentLocation;

    @NotBlank(message = "Last updated date is required")
    private String lastUpdated;

    @NotNull(message = "Delivered status is required")
    private Boolean delivered;
}