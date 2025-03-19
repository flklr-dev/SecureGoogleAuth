import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthPresenter from '../presenter/AuthPresenter';
import { useNavigation } from '../utils/navigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Password strength
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  
  // Error modal
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Check password complexity whenever password changes
  useEffect(() => {
    setHasMinLength(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasLowerCase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    // Only show error if password field has been interacted with
    if (password && !isPasswordComplex()) {
      setPasswordError('Password does not meet complexity requirements');
    } else {
      setPasswordError('');
    }
    
    // Update confirm password error
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const isPasswordComplex = () => {
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleRegister = async () => {
    // First validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = isPasswordComplex();
    const isConfirmPasswordValid = password === confirmPassword;
    
    if (!isPasswordValid) {
      setPasswordError('Password does not meet complexity requirements');
    }
    
    if (!isConfirmPasswordValid) {
      setConfirmPasswordError('Passwords do not match');
    }
    
    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        setIsRegistering(true);
        console.log('Register with:', email, password);
        
        // Use the new registration method
        const result = await AuthPresenter.registerWithEmailPassword(email, password);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Navigate to login screen after successful registration
        setIsRegistering(false);
        navigation.navigate('Login');
        
      } catch (error) {
        setIsRegistering(false);
        showErrorModal(error instanceof Error ? error.message : 'Registration failed');
      }
    }
  };

  // Simulate checking if email exists
  const checkIfEmailExists = async (email: string): Promise<boolean> => {
    // This is just a simulation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, consider emails containing "exists" as already registered
    return email.toLowerCase().includes('exists');
  };

  const getErrorMessage = (error: any): string => {
    // Handle different error types and return appropriate messages
    if (error?.message?.includes('email-already-in-use')) {
      return 'This email is already registered. Please use a different email or try logging in.';
    } else if (error?.message?.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    } else {
      return 'Registration failed. Please try again later.';
    }
  };

  const showErrorModal = (message: string) => {
    console.log('Showing error modal with message:', message);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsRegistering(true);
      console.log('Starting Google sign-up process');
      
      // Make sure GoogleSignin is properly configured before trying to use it
      try {
        const configCheck = GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        console.log('Play services check completed');
      } catch (e) {
        console.error('Play services check failed:', e);
        throw new Error('Google Play Services required for sign-in');
      }
      
      // Try the sign-in
      try {
        console.log('Attempting to sign in with Google...');
        const userInfo = await GoogleSignin.signIn();
        console.log('Google sign-in successful:', userInfo.user.email);
        
        // Call your auth presenter with the user info
        const result = await AuthPresenter.signIn();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        setIsRegistering(false);
        navigation.navigate('Login');
      } catch (signInError) {
        console.error('Google sign-in failed:', signInError);
        throw signInError;
      }
    } catch (error) {
      setIsRegistering(false);
      
      // Simple error message for user
      let errorMessage = 'Google sign-up failed.';
      if (error?.message) {
        errorMessage += ' ' + error.message;
      }
      
      showErrorModal(errorMessage);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // Check if form is valid to enable/disable register button
  const isFormValid = () => {
    // Don't call validateEmail here as it sets state
    const isEmailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return isEmailValid && isPasswordComplex() && password === confirmPassword;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                validateEmail(email);
              }}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => {
                if (isPasswordComplex()) {
                  setPasswordFocused(false);
                }
                if (!password) {
                  setPasswordError('Password is required');
                }
              }}
            />
            <TouchableOpacity 
              style={styles.passwordIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          {passwordFocused && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <Icon 
                  name={hasMinLength ? "check-circle" : "cancel"} 
                  size={16} 
                  color={hasMinLength ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.requirementText, 
                  {color: hasMinLength ? "#4CAF50" : "#F44336"}
                ]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={hasUpperCase ? "check-circle" : "cancel"} 
                  size={16} 
                  color={hasUpperCase ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.requirementText, 
                  {color: hasUpperCase ? "#4CAF50" : "#F44336"}
                ]}>
                  At least one uppercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={hasLowerCase ? "check-circle" : "cancel"} 
                  size={16} 
                  color={hasLowerCase ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.requirementText, 
                  {color: hasLowerCase ? "#4CAF50" : "#F44336"}
                ]}>
                  At least one lowercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={hasNumber ? "check-circle" : "cancel"} 
                  size={16} 
                  color={hasNumber ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.requirementText, 
                  {color: hasNumber ? "#4CAF50" : "#F44336"}
                ]}>
                  At least one number
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={hasSpecialChar ? "check-circle" : "cancel"} 
                  size={16} 
                  color={hasSpecialChar ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.requirementText, 
                  {color: hasSpecialChar ? "#4CAF50" : "#F44336"}
                ]}>
                  At least one special character
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => {
                setConfirmPasswordFocused(false);
                if (!confirmPassword) {
                  setConfirmPasswordError('Confirm password is required');
                } else if (password !== confirmPassword) {
                  setConfirmPasswordError('Passwords do not match');
                }
              }}
            />
            <TouchableOpacity 
              style={styles.passwordIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon 
                name={showConfirmPassword ? "visibility-off" : "visibility"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          
          <TouchableOpacity
            style={[
              styles.registerButton,
              !isFormValid() && styles.disabledButton
            ]}
            onPress={handleRegister}
            disabled={!isFormValid() || isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
            disabled={isRegistering}
          >
            <Image 
              source={require('../assets/google-icon.png')} 
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="error" size={50} color="#EA4335" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Registration Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  passwordIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  passwordRequirements: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 48,
  },
  disabledButton: {
    backgroundColor: '#A4C1F4',
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '600',
  },
  errorText: {
    color: '#EA4335',
    fontSize: 14,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
