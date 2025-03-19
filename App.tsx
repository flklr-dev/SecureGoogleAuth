/**
 * SecureGoogleAuth App
 *
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import LoginScreen from './src/view/LoginScreen';
import RegisterScreen from './src/view/RegisterScreen';
import HomeScreen from './src/view/HomeScreen';
import { NavigationContext } from './src/utils/navigation';
import { Provider as PaperProvider } from 'react-native-paper';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Login');
  
  const navigationValue = {
    navigate: (screen: string) => setCurrentScreen(screen)
  };

  return (
    <PaperProvider>
      <NavigationContext.Provider value={navigationValue}>
        <SafeAreaView style={styles.container}>
          {currentScreen === 'Login' ? (
            <LoginScreen />
          ) : currentScreen === 'Register' ? (
            <RegisterScreen />
          ) : (
            <HomeScreen />
          )}
        </SafeAreaView>
      </NavigationContext.Provider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
