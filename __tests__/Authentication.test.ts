// Test file: __tests__/Authentication.test.ts

import AuthModel from '../src/model/AuthModel';
import * as Keychain from 'react-native-keychain';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Mock dependencies
jest.mock('react-native-keychain');
jest.mock('@react-native-google-signin/google-signin');

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset AuthModel state
    Object.defineProperty(AuthModel, 'state', {
      value: {
        isAuthenticated: false,
        user: null,
        authToken: null,
        loading: false,
        error: null,
      },
      writable: true
    });
    
    // Setup GoogleSignin mock
    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        photo: 'https://example.com/photo.jpg'
      }
    });
    GoogleSignin.getTokens.mockResolvedValue({
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token'
    });
  });

  test('should sign in and store token securely', async () => {
    // Arrange
    Keychain.setGenericPassword.mockResolvedValue(true);
    
    // Act
    const result = await AuthModel.signIn();
    
    // Assert
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(GoogleSignin.getTokens).toHaveBeenCalled();
    
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      expect.any(String), // JSON.stringify(userInfo)
      expect.any(String), // authToken
      expect.objectContaining({
        service: 'auth',
      })
    );
    expect(result.isAuthenticated).toBe(true);
    expect(result.authToken).toBe('mock-id-token');
  });

  test('should handle sign-in failures gracefully', async () => {
    // Arrange
    GoogleSignin.signIn.mockRejectedValue(new Error('Sign in canceled'));
    
    // We need to let the real error handling run and then check the state
    // Act
    try {
      await AuthModel.signIn();
    } catch (e) {
      // Ignore the error - it should be handled in the AuthModel
    }
    
    // Get the state directly - the error should be set in the state
    const state = AuthModel.getState();
    
    // Assert
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toContain('Sign in canceled');
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
  });

  test('should sign out and revoke tokens', async () => {
    // Arrange
    Keychain.resetGenericPassword.mockResolvedValue(true);
    
    // Act
    const result = await AuthModel.signOut();
    
    // Assert
    expect(GoogleSignin.signOut).toHaveBeenCalled();
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'auth'
      })
    );
    expect(result.isAuthenticated).toBe(false);
    expect(result.user).toBeNull();
    expect(result.authToken).toBeNull();
  });
});