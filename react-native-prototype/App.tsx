
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext'; // Adjusted path
import AppNavigator from './src/navigation/AppNavigator'; // Adjusted path
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import vector icons css if needed by the library (check documentation)
// import 'react-native-vector-icons/dist/FontAwesome.css'; // Example for web/desktop compatibility if needed

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
