import React, { useContext, useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons'

import HomeNavigationScreen from "./src/screens/HomeNavigationScreen";
import ProfileSelfScreen from './src/screens/ProfileSelfScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfilesScreen from './src/screens/ProfilesScreen';
import LoginScreen from './src/screens/LoginScreen';

import { Provider as AuthProvider, Context as AuthContext } from './src/context/AuthContext';
import { navigationRef } from './RootNavigation';
import ToastAuto from './src/components/Toast'

const warn = console.warn;
function logWarning(...warnings) {
  let showWarning = true;
  warnings.forEach(warning => {
    if (warning.includes("Toast")) showWarning = false;
  });
  if (showWarning) warn(...warnings);
}
console.warn = logWarning;



const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const App = () => {
  const { token, loginStorage, isLoading } = useContext(AuthContext)

  useEffect(() => {
    loginStorage()
  }, [])


  return (
    <SafeAreaProvider>

      <NavigationContainer ref={navigationRef} theme={NavigationTheme}>
        {isLoading ? null : !token ? (
          <Stack.Navigator
            screenOptions={({ route, navigation }) => ({
              headerShown: false
            })}
          >
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Register' component={RegisterScreen} />
          </Stack.Navigator>
        ) : (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                switch (route.name) {
                  case "Home":
                    return (<MaterialIcons name="home" size={size} color={color} />)
                  case "Perfis":
                    return (<MaterialIcons name="groups" size={size} color={color} />)
                  case "Meu Perfil":
                    return (<MaterialIcons name="account-circle" size={size} color={color} />)
                }
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name='Home' component={HomeNavigationScreen}></Tab.Screen>
            <Tab.Screen name='Perfis' component={ProfilesScreen}></Tab.Screen>
            <Tab.Screen name='Meu Perfil' component={ProfileSelfScreen}></Tab.Screen>
          </Tab.Navigator>
        )
        }
      </NavigationContainer>

    </SafeAreaProvider>
  );
}

export default () => {
  return (
    <AuthProvider>
      <>
        <StatusBar
          animated={true}
          backgroundColor="black"
          barStyle='light-content'
          showHideTransition={'fade'}
        />
        <ToastAuto />
        <App />
      </>
    </AuthProvider>
  )
}

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'white',
    card: '#3F51B5',
    primary: 'white',
    notification: 'white',
  },
};