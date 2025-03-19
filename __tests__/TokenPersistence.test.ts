// Test file: __tests__/TokenPersistence.test.ts

import AuthModel from '../src/model/AuthModel';
import * as Keychain from 'react-native-keychain';

jest.mock('react-native-keychain');

describe('Token Persistence Tests', () => {
  test('should restore authentication state on app restart', async () => {
    // Arrange
    const mockStoredData = JSON.stringify({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    const mockToken = 'stored-access-token';
    
    Keychain.getGenericPassword.mockResolvedValue({
      username: mockStoredData,
      password: mockToken,
      service: 'auth'
    });
    
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
    
    // Act
    await AuthModel.init(); // Using init instead of restoreAuthState
    const state = AuthModel.getState();
    
    // Assert
    expect(Keychain.getGenericPassword).toHaveBeenCalled();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(expect.objectContaining({
      id: 'test-user-id',
      email: 'test@example.com'
    }));
    expect(state.authToken).toBe('stored-access-token');
  });
  
  test('should handle missing credentials gracefully', async () => {
    // Arrange
    Keychain.getGenericPassword.mockResolvedValue(false);
    
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
    
    // Act
    await AuthModel.init(); // Using init instead of restoreAuthState
    const state = AuthModel.getState();
    
    // Assert
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.authToken).toBeNull();
  });

  test('should not restore auth state after app uninstall', async () => {
    // Arrange - Simulate previous authentication
    const mockStoredData = JSON.stringify({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    const mockToken = 'stored-access-token';
    
    // First simulate stored credentials
    Keychain.getGenericPassword.mockResolvedValueOnce({
      username: mockStoredData,
      password: mockToken,
      service: 'auth'
    });
    
    // Then simulate app uninstall (return false as if key not found)
    Keychain.getGenericPassword.mockResolvedValueOnce(false);
    
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
    
    // Act - First init should succeed with stored credentials
    await AuthModel.init();
    const preUninstallState = AuthModel.getState();
    
    // Assert - Auth should be successful
    expect(preUninstallState.isAuthenticated).toBe(true);
    expect(preUninstallState.authToken).toBe('stored-access-token');
    
    // Simulate app uninstall and reinstall (reset state)
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
    
    // Act - Second init should fail to find credentials
    await AuthModel.init();
    const postUninstallState = AuthModel.getState();
    
    // Assert - Auth should not be restored
    expect(postUninstallState.isAuthenticated).toBe(false);
    expect(postUninstallState.user).toBeNull();
    expect(postUninstallState.authToken).toBeNull();
  });
});