package com.smartgrams.userstory1.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;

@Converter
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final String AES = "AES";
    // 128-bit key (16 bytes) - Hardcoded for MVP simplicity. In production, use KMS
    // or Vault.
    private static final String SECRET = "MySuperSecretKey";

    private final Key key;

    public AttributeEncryptor() {
        try {
            key = new SecretKeySpec(SECRET.getBytes(), AES);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize AttributeEncryptor", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null)
            return null;
        try {
            Cipher cipher = Cipher.getInstance(AES);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(cipher.doFinal(attribute.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null)
            return null;
        try {
            Cipher cipher = Cipher.getInstance(AES);
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(Base64.getDecoder().decode(dbData)));
        } catch (Exception e) {
            // Log warning or return raw data if it's not encrypted (e.g. manual DB entry)
            return dbData;
        }
    }
}
