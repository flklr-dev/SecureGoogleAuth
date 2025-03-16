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
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '413300786579-v4nnckujihfa12dkmgjlmgtgb6a3plfa.apps.googleusercontent.com', // Get this from Google Cloud Console
      offlineAccess: true, // If you need a refresh token
      scopes: ['profile', 'email'] // Request minimal scope
    });
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
      
      // Sign in with Google
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Exchange Google token for your backend token
      const idToken = await GoogleSignin.getTokens();
      const response = await api.post('/auth/google', { 
        idToken: idToken.idToken 
      });
      
      const backendToken = response.data.token;
      
      // Store credentials securely
      await Keychain.setGenericPassword(
        JSON.stringify(userInfo.user),
        backendToken,
        { service: 'auth', accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY }
      );
      
      // Update API headers
      api.setAuthToken(backendToken);
      
      this.state = {
        isAuthenticated: true,
        user: userInfo.user,
        authToken: backendToken,
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

  getState(): AuthState {
    return { ...this.state };
  }
}

export default new AuthModel(); 