package com.klef.soa.docker.service;

import java.lang.module.ModuleDescriptor.Builder;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.dto.PackageRequest;
import com.klef.soa.docker.dto.PackageResponse;
import com.klef.soa.docker.entity.PackageTracking;
import com.klef.soa.docker.repository.PackageRepository;

@Service
public class PackageServiceImpl implements PackageService
{

	@Autowired 
	private PackageRepository repo;  
	
	@Override
	public PackageResponse addPackage(PackageRequest request) {
	    PackageTracking packagee = PackageTracking.builder()
	            .trackingCode(request.getTrackingCode())
	            .currentLocation(request.getCurrentLocation())
	            .lastUpdated(request.getLastUpdated())
	            .delivered(request.getDelivered())
	            .build();

	    PackageTracking savedPackage = repo.save(packagee);

	    return mapToResponse(savedPackage);
	}

	@Override
	public List<PackageResponse> displayall() {
	    return repo.findAll()
	            .stream()
	            .map(this::mapToResponse)
	            .toList();
	}

	@Override
	public String delete(Long id) {
		if(repo.existsById(id)) { 
			repo.deleteById(id);
			return "Package deleted Successfully"; 
		}
		else
			return "Package not found";
	}

	@Override
	public String updatePackage(Long id, PackageRequest packagee) {
	    if (repo.existsById(id)) {
	        PackageTracking p = PackageTracking.builder()
	                .id(id)
	                .trackingCode(packagee.getTrackingCode())
	                .currentLocation(packagee.getCurrentLocation())
	                .lastUpdated(packagee.getLastUpdated())
	                .delivered(packagee.getDelivered())
	                .build();

	        repo.save(p);
	        return "Package updated successfully";
	    }
	    return "Package with ID " + id + " not found";
	}

	@Override
	public PackageResponse displayById(Long id) {
	    PackageTracking p = repo.findById(id).orElse(null);
	    if (p == null)
	        return null;
	    return mapToResponse(p);
	}
	
	private PackageResponse mapToResponse(PackageTracking p) {
	    return PackageResponse.builder()
	            .id(p.getId())
	            .trackingCode(p.getTrackingCode())
	            .currentLocation(p.getCurrentLocation())
	            .lastUpdated(p.getLastUpdated())
	            .delivered(p.getDelivered())
	            .build();
	}
}
