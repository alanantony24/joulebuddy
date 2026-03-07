import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Receipt, Zap, Bot, User } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

import HomeScreen      from '../screens/Home';
import BillsScreen     from '../screens/Bills';
import EVScreen        from '../screens/EV';
import JouleBuddyScreen from '../screens/JouleBuddy';
import ProfileScreen   from '../screens/Profile';

const Tab = createBottomTabNavigator();

// ─────────────────────────────────────────────────────────────────────────────
// Tab bar icon wrapper — adds the active-state highlight pill
// ─────────────────────────────────────────────────────────────────────────────
function TabIcon({ IconComponent, focused, isJoule }) {
  const activeColor   = COLORS.mint;     // Emerald Mint for all active tabs
  const inactiveColor = COLORS.textMuted;
  const color         = focused ? activeColor : inactiveColor;

  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: COLORS.mintLight }]}>
      <IconComponent size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.mint,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon IconComponent={Home} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon IconComponent={Receipt} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EV"
        component={EVScreen}
        options={{
          tabBarLabel: 'EV Charging',
          tabBarIcon: ({ focused }) => (
            <TabIcon IconComponent={Zap} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="JouleBuddy"
        component={JouleBuddyScreen}
        options={{
          tabBarLabel: 'JouleBuddy',
          tabBarIcon: ({ focused }) => (
            <TabIcon IconComponent={Bot} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon IconComponent={User} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 0,
    height: 66,
    paddingBottom: 10,
    paddingTop: 6,
    ...SHADOWS.lg,
  },
  tabLabel: {
    ...TYPOGRAPHY.micro,
    fontSize: 9,
    marginTop: 2,
  },
  iconWrap: {
    width: 42,
    height: 30,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
