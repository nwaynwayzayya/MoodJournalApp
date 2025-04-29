import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';
import { View, ActivityIndicator, Text, LogBox, AppState, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Enable screens before any navigation happens
enableScreens();

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import LogMoodScreen from './screens/LogMoodScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangeEmailScreen from './screens/ChangeEmailScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import AboutScreen from './screens/AboutScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#d86553',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Log Mood') {
            iconName = focused ? 'happy' : 'happy-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log Mood" component={LogMoodScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const appState = useRef(AppState.currentState);
  const initializationComplete = useRef(false);

  // Ignore specific warnings
  LogBox.ignoreLogs([
    'AsyncStorage has been extracted from react-native core',
    'Setting a timer',
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground');
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe;

    const initializeApp = async () => {
      try {
        // Add a longer delay for Android to ensure everything is initialized
        const delay = Platform.OS === 'android' ? 500 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (!isMounted) return;

        unsubscribe = auth.onAuthStateChanged(
          (user) => {
            if (!isMounted || initializationComplete.current) return;
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            setUser(user);
            setLoading(false);
            setIsReady(true);
            initializationComplete.current = true;
          },
          (error) => {
            if (!isMounted || initializationComplete.current) return;
            console.error('Auth error:', error);
            setError(error.message);
            setLoading(false);
            setIsReady(true);
            initializationComplete.current = true;
          }
        );
      } catch (error) {
        if (!isMounted || initializationComplete.current) return;
        console.error('Initialization error:', error);
        setError(error.message);
        setLoading(false);
        setIsReady(true);
        initializationComplete.current = true;
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d86553" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d86553" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignupScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
