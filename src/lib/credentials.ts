// ====================================================
// File Name   : credentials.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-22
// Last Update : 2025-08-22

// Description:
// - Service for managing saved user credentials
// - Stores only email address when "Remember Me" is checked
// - Automatically expires credentials after configured days
// - Passwords are never stored in cleartext

// Notes:
// - Uses singleton pattern for service instance
// - Credentials expire after 30 days
// - In production, prefer server-side remember tokens over client-side storage
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
// No external dependencies

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_KEY_CREDENTIALS = 'tuiz_remembered_credentials';
const CREDENTIALS_EXPIRY_DAYS = 30;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_DAY =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: SavedCredentials
 * Description:
 * - Structure for saved credential data
 * - Contains email and timestamp for expiration checking
 */
interface SavedCredentials {
  email: string;
  timestamp: number;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: CredentialsService
 * Description:
 * - Service for managing saved user credentials
 * - Stores only email address (passwords never stored)
 * - Handles credential expiration and cleanup
 */
class CredentialsService {
  /**
   * Method: saveCredentials
   * Description:
   * - Saves email address to localStorage with timestamp
   * - Only email is stored, passwords are never saved
   *
   * Parameters:
   * - email (string): Email address to save
   *
   * Returns:
   * - void: No return value
   */
  saveCredentials(email: string): void {
    const credentials: SavedCredentials = {
      email,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }

  /**
   * Method: getSavedCredentials
   * Description:
   * - Retrieves saved email if credentials exist and haven't expired
   * - Automatically clears expired credentials
   *
   * Returns:
   * - { email: string } | null: Saved email or null if not found or expired
   */
  getSavedCredentials(): { email: string } | null {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
      if (!savedData) {
        return null;
      }

      const credentials: SavedCredentials = JSON.parse(savedData);

      const daysSinceStored = (Date.now() - credentials.timestamp) / MILLISECONDS_PER_DAY;
      if (daysSinceStored > CREDENTIALS_EXPIRY_DAYS) {
        this.clearCredentials();
        return null;
      }

      return {
        email: credentials.email,
      };
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      this.clearCredentials();
      return null;
    }
  }

  /**
   * Method: clearCredentials
   * Description:
   * - Clears saved credentials from localStorage
   *
   * Returns:
   * - void: No return value
   */
  clearCredentials(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_CREDENTIALS);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }

  /**
   * Method: hasRememberedCredentials
   * Description:
   * - Checks if credentials are currently saved and valid
   *
   * Returns:
   * - boolean: True if valid credentials exist, false otherwise
   */
  hasRememberedCredentials(): boolean {
    return this.getSavedCredentials() !== null;
  }
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
// No standalone helper functions - all methods are in CredentialsService class

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const credentialsService = new CredentialsService();
