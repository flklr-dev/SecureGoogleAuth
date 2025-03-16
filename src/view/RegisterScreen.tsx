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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthPresenter from '../presenter/AuthPresenter';

const RegisterScreen: React.FC = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
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

  // Check password complexity whenever password changes
  useEffect(() => {
    setHasMinLength(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasLowerCase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    // Update password error
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

  const handleRegister = () => {
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
      console.log('Register with:', email, password);
      // Implement your registration logic here
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await AuthPresenter.signIn();
      console.log('Google sign-up successful');
    } catch (error) {
      console.error('Google sign-up error:', error);
    }
  };

  const navigateToLogin = () => {
    console.log('Navigate to Login screen');
    // Would navigate to LoginScreen
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
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
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
                // Only hide complexity requirements if password is complex
                if (isPasswordComplex()) {
                  setPasswordFocused(false);
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
          
          {(passwordFocused || !isPasswordComplex()) && (
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
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
          >
            <Image 
              source={require('../assets/google-icon.png')} 
              style={styles.googleIcon}
              // If you don't have this image, you can use:
              // <Icon name="logo-google" size={24} color="#fff" />
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
    marginTop: 10,
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
    backgroundColor: '#DB4437',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    color: 'white',
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
});

export default RegisterScreen;
