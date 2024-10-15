import React, { useState, useLayoutEffect, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, NativeModules } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core'; 
import { createStackNavigator } from '@react-navigation/stack';

import SettingsScreen from "./SettingsScreen";
import CallLogsDetailScreen from "./CallLogsDetailScreen";
import HelpSendFeedbackScreen from "./HelpSendFeedbackScreen";
import AboutScreen from './AboutScreen';
import ProfileScreen from "./ProfileScreen";
import DrawerContent from "../DrawerContent";
import Reposts from './ReportsScreen';
import PrivatePolicy from "./PrivatePolicy";
import SearchScreen from "./SearchScreen";

import NewReportScreen from "./NewReportScreen";

const ReportsStack = createStackNavigator();

type ReportsStackScreenProps = {
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
};

const ReportsStackScreen: React.FC<ReportsStackScreenProps> = ({ navigation, route }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    
    // Hide tab bar for certain routes
    if (  routeName === 'Profile' ||
          routeName === 'CallLogsDetail' || 
          routeName === "SMSDetail" ||
          routeName === "Settings" ||
          routeName === 'HelpSendFeedback' ||  
          routeName === 'About'||
          routeName === 'Policy' ||
          routeName === 'Search' ||
          routeName === 'NewRepost'
      ) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }

    navigation.setOptions({ headerShown: false });

  }, [navigation, route]);

  const setMenuOpen = () =>{
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <ReportsStack.Navigator
        screenOptions={{
          headerShown: false, 
        }}>
        <ReportsStack.Screen
          name="Reposts"
          // component={MyBlocklist} 
          children={(props) => <Reposts {...props} setMenuOpen={()=>setMenuOpen()} />}
          options={{
            headerShown: true, 
          }}/>

        <ReportsStack.Screen
          name="NewRepost"
          // component={MyBlocklist} 
          children={(props) => <NewReportScreen />}
          options={{
            headerShown: true, 
          }}/>
        <ReportsStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'Settings', 
          }}/>
        <ReportsStack.Screen
          name="HelpSendFeedback"
          component={HelpSendFeedbackScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'Help & SendFeedback', 
          }}
        />
        <ReportsStack.Screen
          name="Policy"
          component={PrivatePolicy}
          options={{  
            headerTitle: 'Private policy', 
            headerShown: true, 
          }}
        />
        <ReportsStack.Screen
          name="About"
          component={AboutScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'About', 
          }}
        />
        <ReportsStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'Profile', 
          }}
        />
        <ReportsStack.Screen
          name="CallLogsDetail"
          component={CallLogsDetailScreen}
          options={{  
            headerTitle: '', 
            headerShown: true, 
          }}
        />
        <ReportsStack.Screen
          name="Search"
          component={SearchScreen}
          options={{  
            headerShown: true,
            headerTitle: 'Search', 
          }}
        />
      </ReportsStack.Navigator>
      <DrawerContent isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigation={navigation} />
    </>
  )
}

export default ReportsStackScreen;
  