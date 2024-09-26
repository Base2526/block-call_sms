import React, { useState, useLayoutEffect, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, NativeModules } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core'; 
import { createStackNavigator } from '@react-navigation/stack';

import CallLogsScreen from './CallLogsScreen';
import CallLogsDetailScreen from "./CallLogsDetailScreen";
import SearchScreen from "./SearchScreen";
import SettingsScreen from "./SettingsScreen";
import AboutScreen from './AboutScreen';
import ProfileScreen from "./ProfileScreen";
import DrawerContent from "../DrawerContent";
import SMSDetailScreen from './SMSDetailScreen';

import PrivatePolicy from './PrivatePolicy';

type CallLogsStackScreenProps = {
    navigation: NavigationProp<any>;
    route: RouteProp<any, any>;
};
const CallLogsStack = createStackNavigator();

const CallLogsStackScreen: React.FC<CallLogsStackScreenProps> = ({ navigation, route }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useLayoutEffect(() => {
      const routeName = getFocusedRouteNameFromRoute(route);
      
      // Hide tab bar for certain routes
      if (  routeName === "Profile" || 
            routeName === 'CallLogsDetail' || 
            routeName === 'Search' || 
            routeName === 'Settings' ||
            routeName === 'HelpSendFeedback' || 
            routeName === 'About' ||
            routeName === 'SMSDetail' ||
            routeName === 'Policy'
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
        <CallLogsStack.Navigator
          screenOptions={{
            headerShown: false, 
          }}
          >
          <CallLogsStack.Screen
            name="CallLogs"
            children={(props) => <CallLogsScreen {...props} setMenuOpen={()=>setMenuOpen()} />}
            options={{
              headerTitle: 'Call Logs', 
              headerShown: true, 
            }}
          />
          <CallLogsStack.Screen
              name="CallLogsDetail"
              component={CallLogsDetailScreen}
              options={{  
                headerTitle: '', 
                headerShown: true, 
              }}
            />
            <CallLogsStack.Screen
              name="SMSDetail"
              component={SMSDetailScreen}
              options={{  
                headerTitle: 'SMS', 
                headerShown: true, 
              }}/>
            <CallLogsStack.Screen
              name="Search"
              component={SearchScreen}
              options={{  
                headerTitle: 'Search', 
                headerShown: true, 
              }}
            />
            <CallLogsStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{  
                headerTitle: 'Settings', 
                headerShown: true, 
              }}
            />
            <CallLogsStack.Screen
              name="Policy"
              component={PrivatePolicy}
              options={{  
                headerTitle: 'Private policy', 
                headerShown: true, 
              }}
            />
            <CallLogsStack.Screen
              name="About"
              component={AboutScreen}
              options={{  
                headerTitle: 'About', 
                headerShown: true, 
              }}
            />
            <CallLogsStack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{  
                headerTitle: 'Profile', 
                headerShown: true, 
              }}
            />
        </CallLogsStack.Navigator>
        <DrawerContent 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          navigation={navigation} />
      </>
    )
}

export default CallLogsStackScreen;
  