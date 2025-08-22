// src/lib/credentials.ts

interface SavedCredentials {
  email: string;
  timestamp: number;
}

class CredentialsService {
  private readonly STORAGE_KEY = 'tuiz_remembered_credentials';
  private readonly EXPIRY_DAYS = 30; // Credentials expire after 30 days

  // Save only the email when "Remember Me" is checked. Passwords must not be stored in cleartext.
  // In a production app prefer returning a short-lived remember token from the server instead.
  saveCredentials(email: string): void {
    const credentials: SavedCredentials = {
      email,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.warn('Failed to save credentials:', error);
    }
  }

  // Get saved credentials (email only) if they exist and haven't expired
  getSavedCredentials(): { email: string } | null {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) {
        return null;
      }

      const credentials: SavedCredentials = JSON.parse(savedData);

      // Check if credentials have expired
      const daysSinceStored = (Date.now() - credentials.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceStored > this.EXPIRY_DAYS) {
        this.clearCredentials();
        return null;
      }

      return {
        email: credentials.email,
      };
    } catch (error) {
      console.warn('Failed to retrieve credentials:', error);
      this.clearCredentials();
      return null;
    }
  }

  // Clear saved credentials
  clearCredentials(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear credentials:', error);
    }
  }

  // Check if credentials are currently saved
  hasRememberedCredentials(): boolean {
    return this.getSavedCredentials() !== null;
  }
}

export const credentialsService = new CredentialsService();
