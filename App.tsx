/**
 * SecureGoogleAuth App
 *
 * @format
 */

import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import LoginScreen from './src/view/LoginScreen';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <LoginScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
