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
import MyProfileScreen from "./ProfileScreen";
import DrawerContent from "../DrawerContent";
import Reposts from './ReportsScreen';
import PrivatePolicy from "./PrivatePolicy";
import SearchScreen from "./SearchScreen";

import NewReportScreen from "./NewReportScreen";
import ReportDetailScreen from "./ReportDetailScreen";

import CommentsScreen from "../comments"

import UserProfileScreen from '../profile';

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
          routeName === 'NewRepost' ||
          routeName === 'ReportDetail' ||
          routeName === 'Comments' ||
          routeName === 'UserProfile'
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
            headerTitle: 'หน้าหลัก', 
          }}/>

        <ReportsStack.Screen
          name="NewRepost"
          // component={MyBlocklist} 
          children={(props) => <NewReportScreen />}
          options={{
            headerShown: true, 
            headerTitle: '', 
          }}/>
        <ReportsStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'ตั้งค่า', 
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
          component={MyProfileScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'โปรไฟล์', 
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
            headerTitle: 'ค้นหา', 
          }}
        />
        <ReportsStack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          options={{  
            headerShown: true,
            headerTitle: '', 
          }}
        />

        <ReportsStack.Screen
          name="Comments"
          component={CommentsScreen}
          options={{  
            headerShown: true,
            headerTitle: 'คอมเมนต์', 
          }}
        />
        {/*  */}

        <ReportsStack.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={{  
            headerShown: true,
            headerTitle: 'โปรไฟร์', 
          }}
        />
      </ReportsStack.Navigator>
      <DrawerContent isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigation={navigation} />
    </>
  )
}

export default ReportsStackScreen;