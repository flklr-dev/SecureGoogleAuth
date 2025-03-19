import { jest } from '@jest/globals';

// Mock for Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          photo: 'https://example.com/photo.jpg'
        }
      }),
      getTokens: jest.fn().mockResolvedValue({
        idToken: 'mock-id-token',
        accessToken: 'mock-access-token'
      }),
      signOut: jest.fn().mockResolvedValue(null),
      revokeAccess: jest.fn().mockResolvedValue(null),
      isSignedIn: jest.fn().mockResolvedValue(false),
      getCurrentUser: jest.fn().mockResolvedValue(null),
    },
    statusCodes: {
      SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
      IN_PROGRESS: 'IN_PROGRESS',
      PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
  };
});

// Mock for Keychain
jest.mock('react-native-keychain', () => {
  return {
    setGenericPassword: jest.fn().mockResolvedValue(true),
    getGenericPassword: jest.fn().mockResolvedValue(false),
    resetGenericPassword: jest.fn().mockResolvedValue(true),
    ACCESSIBLE: {
      WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    },
    ACCESS_CONTROL: {
      BIOMETRY_ANY: 'AccessControlBiometryAny',
    },
  };
}); 