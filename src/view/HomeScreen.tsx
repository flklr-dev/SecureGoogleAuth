import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthPresenter from '../presenter/AuthPresenter';
import { useNavigation } from '../utils/navigation';
import { Portal, Modal as PaperModal, Button, Avatar } from 'react-native-paper';

// Define icons properly to avoid type issues
const ICONS = {
  logout: Platform.OS === 'android' 
    ? require('../assets/logout.png') // Use direct require statements instead of URI
    : require('../assets/logout.png'),
  user: Platform.OS === 'android'
    ? require('../assets/user.png')
    : require('../assets/user.png'),
  security: Platform.OS === 'android'
    ? require('../assets/security.png')
    : require('../assets/security.png')
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = AuthPresenter.getAuthState().user;
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  
  const handleLogoutPress = () => {
    setLogoutDialogVisible(true);
  };

  const handleSignOut = async () => {
    setLogoutDialogVisible(false);
    await AuthPresenter.signOut();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Secure Home</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogoutPress}
          testID="logout-button"
        >
          <Image 
            source={ICONS.logout} 
            style={styles.icon} 
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content} 
        style={styles.scrollContainer}
      >
        <View style={styles.profileSection}>
          <Avatar.Image 
            size={100} 
            source={{ uri: user?.user?.photo }} 
            style={styles.profilePicture}
          />
          <Text style={styles.profileName}>
            {user?.user?.name || 'User'}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.user?.email || 'No email available'}
          </Text>
        </View>

        <View style={styles.userInfoSection}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          {user && user.user && (
            <>
              <View style={styles.infoRow}>
                <Icon name="person" size={24} color="#4285F4" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoText}>
                    {user.user.name || 'Not available'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="email" size={24} color="#4285F4" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoText}>
                    {user.user.email || 'Not available'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          <View style={styles.securityContent}>
            <Icon name="security" size={40} color="#4CAF50" style={styles.securityIcon} />
            <Text style={styles.securityText}>
              Your session is secure and encrypted
            </Text>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <PaperModal
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Icon name="logout" size={50} color="#f44336" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined"
                onPress={() => setLogoutDialogVisible(false)}
                style={styles.modalButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
              <Button 
                mode="contained"
                onPress={handleSignOut}
                style={[styles.modalButton, styles.logoutConfirmButton]}
                labelStyle={styles.logoutButtonLabel}
              >
                Sign Out
              </Button>
            </View>
          </View>
        </PaperModal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicture: {
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  userInfoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  securitySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  securityContent: {
    alignItems: 'center',
  },
  securityIcon: {
    marginBottom: 12,
  },
  securityText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: 'white',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    minWidth: 130,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  logoutConfirmButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#666',
  },
  logoutButtonLabel: {
    fontSize: 16,
    color: 'white',
  },
});

export default HomeScreen; 