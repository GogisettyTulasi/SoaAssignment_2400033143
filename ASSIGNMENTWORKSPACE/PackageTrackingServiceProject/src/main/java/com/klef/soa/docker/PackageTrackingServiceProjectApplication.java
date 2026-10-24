package com.klef.soa.docker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PackageTrackingServiceProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(PackageTrackingServiceProjectApplication.class, args);
		System.out.println("Project Service is running...");
	}

}
