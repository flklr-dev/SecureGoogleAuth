import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import * as Keychain from 'react-native-keychain';
import api from '../services/api';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  authToken: string | null;
  loading: boolean;
  error: string | null;
}

class AuthModel {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    authToken: null,
    loading: false,
    error: null,
  };

  constructor() {
    // Remove or comment out the existing GoogleSignin.configure
    // GoogleSignin.configure({
    //   webClientId: '615048959288-411ri03eldq6hg0fu7k705f5jr5c0ceu.apps.googleusercontent.com', 
    //   offlineAccess: true,
    //   scopes: ['profile', 'email']
    // });
  }

  async init(): Promise<void> {
    try {
      // Attempt to restore session
      const credentials = await Keychain.getGenericPassword({ service: 'auth' });
      if (credentials) {
        const { username, password } = credentials;
        this.state = {
          ...this.state,
          isAuthenticated: true,
          user: JSON.parse(username),
          authToken: password,
        };
        
        // Update API headers with token
        api.setAuthToken(password);
      }
    } catch (error) {
      console.error('Failed to restore authentication state', error);
    }
  }

  async signIn(): Promise<AuthState> {
    try {
      this.state = { ...this.state, loading: true, error: null };
      
      console.log('1. Starting Google Sign-In process');
      
      // Check if Google Play services are available
      try {
        await GoogleSignin.hasPlayServices({ 
          showPlayServicesUpdateDialog: true 
        });
        console.log('2. Google Play Services check passed');
      } catch (playError) {
        console.error('Google Play Services error:', playError);
        throw new Error('Google Play Services required: ' + (playError instanceof Error ? playError.message : 'Unknown error'));
      }
      
      // Perform actual Google Sign-In
      let signInResponse;
      try {
        console.log('3. Calling GoogleSignin.signIn()');
        signInResponse = await GoogleSignin.signIn();
        console.log('4. GoogleSignin.signIn() response:', JSON.stringify(signInResponse));
      } catch (signInError) {
        console.error('GoogleSignin.signIn() failed:', signInError);
        throw new Error('Google sign-in failed: ' + (signInError instanceof Error ? signInError.message : 'Unknown error'));
      }
      
      // Get the tokens
      const { idToken } = await GoogleSignin.getTokens();
      
      // Get current user info
      const userInfo = await GoogleSignin.getCurrentUser();
      
      if (!userInfo || !idToken) {
        throw new Error('Failed to get user information or token');
      }
      
      // Store credentials securely
      await Keychain.setGenericPassword(
        JSON.stringify(userInfo),
        idToken,
        { service: 'auth' }
      );
      
      console.log('5. Stored credentials in Keychain');
      
      // Update API headers
      api.setAuthToken(idToken);
      
      this.state = {
        isAuthenticated: true,
        user: userInfo,
        authToken: idToken,
        loading: false,
        error: null,
      };
      
      console.log('6. Authentication completed successfully');
      return this.state;
    } catch (error) {
      console.error('Google sign-in error details:', error);
      this.state = {
        ...this.state,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
      return this.state;
    }
  }

  async signOut(): Promise<AuthState> {
    try {
      this.state = { ...this.state, loading: true };
      
      // Sign out from Google
      await GoogleSignin.signOut();
      
      // Clear secure storage
      await Keychain.resetGenericPassword({ service: 'auth' });
      
      // Clear API headers
      api.clearAuthToken();
      
      this.state = {
        isAuthenticated: false,
        user: null,
        authToken: null,
        loading: false,
        error: null,
      };
      
      return this.state;
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
      return this.state;
    }
  }

  async signInWithEmailPassword(email: string, _password: string): Promise<AuthState> {
    try {
      this.state = { ...this.state, loading: true, error: null };
      
      // In a real app, you would call your backend API here
      // For demo, simulate successful login if email doesn't contain "error"
      if (email.includes("error")) {
        throw new Error("Invalid email or password");
      }
      
      // Simulate API response
      const mockUser = {
        id: "123",
        name: email.split('@')[0],
        email: email,
        photo: null,
      };
      
      const mockToken = "mock-jwt-token-" + Math.random().toString(36).substring(2);
      
      // Store credentials securely
      await Keychain.setGenericPassword(
        JSON.stringify(mockUser),
        mockToken,
        { service: 'auth', accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY }
      );
      
      // Update API headers
      api.setAuthToken(mockToken);
      
      this.state = {
        isAuthenticated: true,
        user: mockUser as User,
        authToken: mockToken,
        loading: false,
        error: null,
      };
      
      return this.state;
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
      return this.state;
    }
  }

  async registerWithEmailPassword(email: string, _password: string): Promise<AuthState> {
    try {
      this.state = { ...this.state, loading: true, error: null };
      
      // In a real app, you would call your backend API here
      // For demo, simulate registration failure if email contains "exists"
      if (email.includes("exists")) {
        throw new Error("This email is already registered");
      }
      
      // Simulate successful registration
      // In a real app, this would create a new user account
      
      // For demo purposes, we'll just set the state but not authenticate
      this.state = {
        ...this.state,
        loading: false,
        error: null
      };
      
      return this.state;
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
      return this.state;
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }
}

export default new AuthModel(); 