package com.klef.soa.docker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.docker.dto.PackageRequest;
import com.klef.soa.docker.dto.PackageResponse;
import com.klef.soa.docker.service.PackageServiceImpl;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@CrossOrigin(origins = "http://localhost:5176")
public class PackageController 
{
	@Autowired
	private PackageServiceImpl service;
	
	@GetMapping("/")
	public String Home() {
		return "Package Tracking Service is running...";
	}
	
	@PostMapping("/addPackage") 
	public PackageResponse addPackage(@Valid @RequestBody PackageRequest packagee) {
		return service.addPackage(packagee); 
	}
	
	@GetMapping("/displayAll")
	public List<PackageResponse> getAllPackages() 
	{
		return service.displayall();
	}
	 
	@DeleteMapping("/delete/{id}")
	public String deletePackage(@PathVariable long id) {
		return service.delete(id);
	}
	
	@PutMapping("/update/{id}")
	public String updatePackage(@Valid @RequestBody PackageRequest packagee,@PathVariable Long id)
	{
		return service.updatePackage(id, packagee);
	}
	
	@GetMapping("/displayById/{id}")
	public PackageResponse displayById(@PathVariable Long id)
	{
		return service.displayById(id);
	}
	
}
