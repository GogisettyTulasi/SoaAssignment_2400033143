package com.klef.soa.docker.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PackageResponse 
{
	private Long id;
    private String lastUpdated;
    private String trackingCode; 
    private String currentLocation;
    private boolean delivered;
}
