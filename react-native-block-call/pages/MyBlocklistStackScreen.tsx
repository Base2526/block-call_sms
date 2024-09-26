import React, { useState, useLayoutEffect, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, NativeModules } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core'; 
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

import TabIconWithMenu from "../TabIconWithMenu"
import SettingsScreen from "./SettingsScreen";
import CallLogsDetailScreen from "./CallLogsDetailScreen";
import HelpSendFeedbackScreen from "./HelpSendFeedbackScreen";
import AboutScreen from './AboutScreen';
import ProfileScreen from "./ProfileScreen";
import DrawerContent from "../DrawerContent";
import MyBlocklist from './MyBlocklistScreen';
import PrivatePolicy from "./PrivatePolicy"

const MyBlocklistStack = createStackNavigator();

type MyBlocklistStackScreenProps = {
    navigation: NavigationProp<any>;
    route: RouteProp<any, any>;
  };

const MyBlocklistStackScreen: React.FC<MyBlocklistStackScreenProps> = ({ navigation, route }) => {
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
      <MyBlocklistStack.Navigator
        screenOptions={{
          headerShown: false, 
        }}>
        <MyBlocklistStack.Screen
          name="Blocklist"
          // component={MyBlocklist} 
          children={(props) => <MyBlocklist {...props} setMenuOpen={()=>setMenuOpen()} />}
          options={{
            headerShown: true, 
          }}/>
        <MyBlocklistStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{  
            headerShown: true, 
            headerTitle: 'Settings', 
          }}/>
          <MyBlocklistStack.Screen
            name="HelpSendFeedback"
            component={HelpSendFeedbackScreen}
            options={{  
              headerShown: true, 
              headerTitle: 'Help & SendFeedback', 
            }}
          />
          <MyBlocklistStack.Screen
            name="Policy"
            component={PrivatePolicy}
            options={{  
              headerTitle: 'Private policy', 
              headerShown: true, 
            }}
          />
          <MyBlocklistStack.Screen
            name="About"
            component={AboutScreen}
            options={{  
              headerShown: true, 
              headerTitle: 'About', 
            }}
          />
          <MyBlocklistStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{  
              headerShown: true, 
              headerTitle: 'Profile', 
            }}
          />
          <MyBlocklistStack.Screen
              name="CallLogsDetail"
              component={CallLogsDetailScreen}
              options={{  
                headerTitle: '', 
                headerShown: true, 
              }}
            />
      </MyBlocklistStack.Navigator>
      <DrawerContent isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigation={navigation} />
    </>
  )
}

export default MyBlocklistStackScreen;
  