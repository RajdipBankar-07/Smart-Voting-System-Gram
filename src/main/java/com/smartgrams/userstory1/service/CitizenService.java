package com.smartgrams.userstory1.service;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import com.smartgrams.userstory1.entity.Citizen;

public interface CitizenService {

    List<Citizen> getAllCitizens();

    Citizen createCitizen(Citizen citizen);

    Citizen createCitizenJson(Citizen citizen, Integer wardNumber);

    Citizen createCitizenMultipart(Citizen citizen, Integer wardNumber, MultipartFile photo, MultipartFile aadharCard,
            MultipartFile voterIdCard);

    Citizen updateCitizenMultipart(Long id, Citizen citizen, Integer wardNumber, MultipartFile photo,
            MultipartFile aadharCard, MultipartFile voterIdCard);

    Citizen verifyCitizen(Long id, boolean isApproved, String remarks);

    Citizen getCitizen(Long id);

    List<Citizen> getCitizensByWard(Integer wardNumber);

    Citizen updateCitizen(Long id, Citizen citizen);

    Citizen updateCitizenByIdAndName(Long id, String fullName, Citizen citizen, MultipartFile photo);

    Citizen uploadCitizenPhoto(Long id, MultipartFile file);

    Map<String, String> deleteCitizen(Long id);

    Citizen updateMyProfile(Long id, String address, String mobile, MultipartFile photo, MultipartFile aadharCard);

    Map<String, Object> bulkUploadCitizens(MultipartFile file);
}
