import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, User, Users, Wallet } from 'lucide-react-native';
import { Colors } from '../../src/constants/Colors';

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            height: 60,
            paddingBottom: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="students"
          options={{
            title: 'Öğrenciler',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="lessons"
          options={{
        title: 'Bakiye',
        tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
      }}
    />
    <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
      <StatusBar style="dark" />
    </>
  );
}
