import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DollarSign, Home, User, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { teacher } = useData();
  const themeColor = teacher?.themeColor || Colors.primary;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: themeColor,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopWidth: 1,
            borderTopColor: Colors.borderLight,
            height: 85,
            paddingTop: 8,
            paddingBottom: 24,
            paddingHorizontal: 16,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 8,
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('dashboard.title'),
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? {
                backgroundColor: color + '20',
                padding: 8,
                borderRadius: 12,
              } : { padding: 8 }}>
                <Home size={22} color={color} fill={focused ? color : 'transparent'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="students"
          options={{
            title: t('students.title'),
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? {
                backgroundColor: color + '20',
                padding: 8,
                borderRadius: 12,
              } : { padding: 8 }}>
                <Users size={22} color={color} fill={focused ? color : 'transparent'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="finance"
          options={{
            title: t('finance.title'),
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? {
                backgroundColor: '#0F172A',
                padding: 10,
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              } : { padding: 8 }}>
                <DollarSign size={focused ? 20 : 22} color={focused ? '#FFF' : color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile.title'),
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? {
                backgroundColor: color + '20',
                padding: 8,
                borderRadius: 12,
              } : { padding: 8 }}>
                <User size={22} color={color} fill={focused ? color : 'transparent'} />
              </View>
            ),
          }}
        />
      </Tabs>
      <StatusBar style="dark" />
    </>
  );
}
