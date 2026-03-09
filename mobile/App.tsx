import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SessionsScreen from './src/screens/SessionsScreen';
import LiveSessionCockpit from './src/screens/LiveSessionCockpit';
import StudentsScreen from './src/screens/StudentsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CmsPageScreen from './src/screens/CmsPageScreen';
import ExamsScreen from './src/screens/ExamsScreen';
import ExamSessionScreen from './src/screens/ExamSessionScreen';
import { useAuthStore } from './src/store';

import { COLORS } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.surface,
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Accueil', title: 'Quran School' }} />
            <Tab.Screen name="Sessions" component={SessionsScreen} options={{ tabBarLabel: 'Séances', title: 'Mes Séances' }} />
            <Tab.Screen name="Students" component={StudentsScreen} options={{ tabBarLabel: 'Élèves', title: 'Élèves' }} />
            <Tab.Screen name="Exams" component={ExamsScreen} options={{ tabBarLabel: 'Examens', title: 'Examens' }} />
            <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progression', title: 'Progression' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil', title: 'Mon Profil' }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const loadUser = useAuthStore((s) => s.loadUser);

    React.useEffect(() => {
        loadUser();
    }, []);

    if (isLoading) {
        return null; // Or a splash screen
    }

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="LiveSession" component={LiveSessionCockpit} />
                        <Stack.Screen name="CmsPage" component={CmsPageScreen} />
                        <Stack.Screen name="ExamSession" component={ExamSessionScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
