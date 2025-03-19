import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image 
} from 'react-native';
import { 
  Button, 
  Text, 
  TextInput,
  MD3LightTheme,
  Provider as PaperProvider,
  Portal,
  Modal as PaperModal
} from 'react-native-paper';
import AuthPresenter from '../presenter/AuthPresenter';
import { AuthState } from '../model/AuthModel';
import { useNavigation } from '../utils/navigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4285F4',
  },
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    authToken: null,
    loading: false,
    error: null,
  });
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Configure GoogleSignin once with all needed options
    GoogleSignin.configure({
      webClientId: '615048959288-411ri03eldq6hg0fu7k705f5jr5c0ceu.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true, 
      prompt: 'select_account' // Forces account selection dialog
    });
  }, []);

  const validateEmail = (email: string, isTouched: boolean = true) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email && isTouched) {
      setEmailError('Email is required');
      return false;
    } else if (email && !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (password: string, isTouched: boolean = true) => {
    if (!password && isTouched) {
      setPasswordError('Password is required');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text, emailTouched);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text, passwordTouched);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email, true);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    validatePassword(password, true);
  };

  const handleEmailFocus = () => {
    if (!emailTouched) {
      setEmailTouched(true);
    }
  };

  const handlePasswordFocus = () => {
    if (!passwordTouched) {
      setPasswordTouched(true);
    }
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoggingIn(true);
      try {
        await AuthPresenter.signInWithEmailPassword(email, password);
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      // Force the account picker dialog to show by signing out first
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log('No previous session to sign out from');
      }
      
      // Get available play services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo);
      
      // Call AuthPresenter to handle the sign-in
      const result = await AuthPresenter.signIn();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Extract user name - handle different response formats
      let userName = '';
      if (userInfo.user) {
        userName = userInfo.user.name || userInfo.user.email;
      } else if (userInfo.data && userInfo.data.user) {
        userName = userInfo.data.user.name || userInfo.data.user.email;
      } else {
        userName = 'User';
      }

      // Show success message
      setSuccessMessage(`Welcome ${userName}!`);
      setSuccessModalVisible(true);
      
      // Ensure navigation happens after modal is shown
      setTimeout(() => {
        // First close the modal
        setSuccessModalVisible(false);
        
        // Then navigate immediately with a small delay to ensure
        // the modal closing animation completes
        setTimeout(() => {
          try {
            console.log('Navigating to Home screen');
            navigation.navigate('Home');
          } catch (e) {
            console.error('Navigation error:', e);
          }
        }, 100);
      }, 1500);

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Sign in failed');
      setErrorModalVisible(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text variant="headlineMedium" style={styles.title}>Secure Auth</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
              onFocus={handleEmailFocus}
              mode="outlined"
              error={!!emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <TextInput
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={handlePasswordBlur}
              onFocus={handlePasswordFocus}
              mode="outlined"
              error={!!passwordError}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <Button
              mode="text"
              onPress={() => {}}
              style={styles.forgotPassword}
            >
              Forgot Password?
            </Button>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoggingIn}
              disabled={isLoggingIn || !!emailError || !!passwordError}
              style={styles.loginButton}
            >
              Login
            </Button>

            <View style={styles.orContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              onPress={handleGoogleSignIn}
              disabled={isLoggingIn}
              style={styles.googleButton}
              icon={() => (
                <Image 
                  source={require('../assets/google-icon.png')} 
                  style={styles.googleIcon}
                />
              )}
            >
              Sign in with Google
            </Button>
          </View>
        </ScrollView>

        <Portal>
          {/* Success Modal */}
          <PaperModal
            visible={successModalVisible}
            onDismiss={() => setSuccessModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Text style={styles.modalIcon}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalMessage}>{successMessage}</Text>
            </View>
          </PaperModal>

          {/* Error Modal */}
          <PaperModal
            visible={errorModalVisible}
            onDismiss={() => setErrorModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={[styles.modalIconContainer, styles.errorIconContainer]}>
                <Text style={[styles.modalIcon, styles.errorIcon]}>!</Text>
              </View>
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalMessage}>{errorMessage}</Text>
              <Button
                mode="contained"
                onPress={() => setErrorModalVisible(false)}
                style={styles.modalButton}
              >
                OK
              </Button>
            </View>
          </PaperModal>
        </Portal>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  loginButton: {
    marginBottom: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  googleButton: {
    marginBottom: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconContainer: {
    backgroundColor: '#F44336',
  },
  modalIcon: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  errorIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 8,
    width: '100%',
  },
});

export default LoginScreen; 
