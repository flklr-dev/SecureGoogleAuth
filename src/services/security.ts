import * as Keychain from 'react-native-keychain';

export interface SecureStorageOptions {
  service?: string;
  useBiometrics?: boolean;
}

class SecurityService {
  async storeSecureData(
    key: string, 
    value: string, 
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      const result = await Keychain.setGenericPassword(
        key,
        value,
        {
          service: options.service || 'default',
          accessControl: options.useBiometrics 
            ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY 
            : Keychain.ACCESS_CONTROL.USER_PRESENCE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        }
      );
      return !!result;
    } catch (error) {
      console.error('Failed to store secure data:', error);
      return false;
    }
  }

  async getSecureData(
    options: SecureStorageOptions = {}
  ): Promise<{ key: string; value: string } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: options.service || 'default'
      });
      
      if (credentials) {
        return {
          key: credentials.username,
          value: credentials.password
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  async deleteSecureData(
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      const result = await Keychain.resetGenericPassword({
        service: options.service || 'default'
      });
      return result;
    } catch (error) {
      console.error('Failed to delete secure data:', error);
      return false;
    }
  }
}

export default new SecurityService(); 