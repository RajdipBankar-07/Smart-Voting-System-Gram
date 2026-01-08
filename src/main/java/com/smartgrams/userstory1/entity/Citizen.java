package com.smartgrams.userstory1.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

@Entity
@Table(name = "citizens")
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate birthDate;

    private Integer age;

    @Column(nullable = false)
    private String address;

    private String vastiName;

    @jakarta.persistence.Convert(converter = com.smartgrams.userstory1.util.AttributeEncryptor.class)
    @Column(nullable = false, unique = true, length = 100) // length increased for ciphertext
    private String aadharNumber;

    private String photoPath;

    private String aadharCardPath;

    @com.fasterxml.jackson.annotation.JsonProperty("voterIdCardPath")
    @Column(name = "voter_id_card_path")
    private String voterIdCardPath;

    @Column(nullable = false)
    private String gender; // MALE, FEMALE, OTHER

    @ManyToOne
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Column(name = "citizen_id", unique = true)
    private String citizenId;

    @Column(nullable = false, unique = true, length = 10)
    private String mobileNumber;

    @Column(name = "voter_id")
    private String voterId; // Optional link

    @Column(name = "family_id")
    private String familyId; // For grouping households

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CitizenStatus status = CitizenStatus.ACTIVE;

    @Column(nullable = false)
    private Boolean hasVoted = false;

    @Column(unique = true)
    private String username;

    private String password;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getVastiName() {
        return vastiName;
    }

    public void setVastiName(String vastiName) {
        this.vastiName = vastiName;
    }

    // Returns MASKED value for UI safety
    public String getAadharNumber() {
        return aadharNumber;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("maskedAadhar")
    public String getMaskedAadhar() {
        if (this.aadharNumber == null)
            return null;
        if (this.aadharNumber.length() < 4)
            return "XXXX-XXXX-XXXX";
        return "XXXX-XXXX-" + this.aadharNumber.substring(this.aadharNumber.length() - 4);
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getRealAadharNumber() {
        return this.aadharNumber;
    }

    public void setAadharNumber(String aadharNumber) {
        this.aadharNumber = aadharNumber;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }

    public String getAadharCardPath() {
        return aadharCardPath;
    }

    public void setAadharCardPath(String aadharCardPath) {
        this.aadharCardPath = aadharCardPath;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("voterIdCardPath")
    public String getVoterIdCardPath() {
        return voterIdCardPath;
    }

    public void setVoterIdCardPath(String voterIdCardPath) {
        this.voterIdCardPath = voterIdCardPath;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Ward getWard() {
        return ward;
    }

    public void setWard(Ward ward) {
        this.ward = ward;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getVoterId() {
        return voterId;
    }

    public void setVoterId(String voterId) {
        this.voterId = voterId;
    }

    public String getFamilyId() {
        return familyId;
    }

    public void setFamilyId(String familyId) {
        this.familyId = familyId;
    }

    public CitizenStatus getStatus() {
        return status;
    }

    public void setStatus(CitizenStatus status) {
        this.status = status;
    }

    public Boolean getHasVoted() {
        return hasVoted;
    }

    public void setHasVoted(Boolean hasVoted) {
        this.hasVoted = hasVoted;
    }
}
