package com.klef.soa.docker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="Packages")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageTracking 
{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false,unique=true)
	private String trackingCode;
	
	@Column(nullable=false)
	private String currentLocation;
	
	@Column(nullable=false)
	private String lastUpdated;
	
	@Column(nullable=false)  
	private Boolean delivered;
}
