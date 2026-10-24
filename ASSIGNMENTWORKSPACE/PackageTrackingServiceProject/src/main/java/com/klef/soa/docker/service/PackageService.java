package com.klef.soa.docker.service;

import java.util.List;

import com.klef.soa.docker.dto.PackageRequest;
import com.klef.soa.docker.dto.PackageResponse;
import com.klef.soa.docker.entity.PackageTracking;

public interface PackageService 
{

	PackageResponse addPackage(PackageRequest packagee);
	
	String updatePackage(Long id,PackageRequest packagee);
	
	PackageResponse displayById(Long id);
	
	List<PackageResponse> displayall(); 
	
	String delete(Long id);
}
