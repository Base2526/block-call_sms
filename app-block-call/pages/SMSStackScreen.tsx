import React, { useState, useLayoutEffect, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, NativeModules } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core'; 
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';


import TabIconWithMenu from "../TabIconWithMenu";
import SettingsScreen from "./SettingsScreen";
import HelpSendFeedbackScreen from "./HelpSendFeedbackScreen";
import AboutScreen from './AboutScreen';
import ProfileScreen from "./ProfileScreen";
import DrawerContent from "../DrawerContent";
import SMSScreen from './SMSScreen';
import SMSDetailScreen from './SMSDetailScreen';
import SearchScreen from "./SearchScreen";

import PrivatePolicy from "./PrivatePolicy"

const SMSStack = createStackNavigator();

type SMSStackScreenProps = {
    navigation: NavigationProp<any>;
    route: RouteProp<any, any>;
};

const SMSStackScreen: React.FC<SMSStackScreenProps> = ({ navigation, route }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useLayoutEffect(() => {
      const routeName = getFocusedRouteNameFromRoute(route);
      
      // Hide tab bar for certain routes
      if (  routeName === 'Profile' ||
            routeName === "SMSDetail" || 
            routeName === 'Settings' ||
            routeName === 'HelpSendFeedback' ||  
            routeName === 'Search' ||
            routeName ==='About' ||
            routeName === 'Policy') {
        navigation.setOptions({ tabBarStyle: { display: 'none' } });
      } else {
        navigation.setOptions({ tabBarStyle: { display: 'flex' } });
      }
  
      // navigation.setOptions({
      //   headerLeft: () => (
      //     <TouchableOpacity onPress={() => { setIsMenuOpen(!isMenuOpen) }} style={styles.menuButton}>
      //       <Icon name="bars" size={24} />
      //     </TouchableOpacity>
      //   ),
      //   headerRight: () => (
      //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      //       <TouchableOpacity 
      //         style={{ padding:5, marginRight: 10 }} 
      //         onPress={()=>{ navigation.navigate("Search") }}>
      //         <Icon name="search" size={25} color="#333" />
      //       </TouchableOpacity>
      //       <TabIconWithMenu 
      //         iconName="ellipsis-v"
      //         menuItems={[
      //           { label: 'Clear all', onPress: () => console.log('Item 1 pressed') },
      //         ]}/>
      //     </View>
      //   ),
      //   headerShown:  routeName === "Profile" ||
      //                 routeName === "SMSDetail" || 
      //                 routeName === 'Settings' || 
      //                 routeName === 'HelpSendFeedback' ||  
      //                 routeName === 'Search' ||
      //                 routeName ==='About'? false : true, // hide/show header parent
      // });

      navigation.setOptions({ headerShown: false });
  
    }, [navigation, route]);
  
    const setMenuOpen = () =>{
      setIsMenuOpen(!isMenuOpen)
    }

    return (
      <>
        <SMSStack.Navigator
         screenOptions={{
          headerShown: false, 
        }}>
          <SMSStack.Screen
            name="SMS"
            // component={SMSScreen} 
            children={(props) => <SMSScreen {...props} setMenuOpen={()=>setMenuOpen()} />}
            options={{
              headerShown: true,
            }}/>
          
          <SMSStack.Screen
            name="SMSDetail"
            component={SMSDetailScreen}
            options={{  
              headerShown: true,
              headerTitle: 'SMS', 
            }}/>
          <SMSStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{  
              headerShown: true,
              headerTitle: 'Settings', 
            }}/>
          <SMSStack.Screen
            name="HelpSendFeedback"
            component={HelpSendFeedbackScreen}
            options={{  
              headerShown: true,
              headerTitle: 'Help & SendFeedback', 
            }}/>
          <SMSStack.Screen
            name="Policy"
            component={PrivatePolicy}
            options={{  
              headerTitle: 'Private policy', 
              headerShown: true, 
            }}
          />
          <SMSStack.Screen
            name="About"
            component={AboutScreen}
            options={{  
              headerShown: true,
              headerTitle: 'About', 
            }}/>
          <SMSStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{  
              headerShown: true,
              headerTitle: 'Profile', 
            }}/>
          <SMSStack.Screen
            name="Search"
            component={SearchScreen}
            options={{  
              headerShown: true,
              headerTitle: 'Search', 
            }}/>
        </SMSStack.Navigator>
        <DrawerContent isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigation={navigation} />
      </>
    )
}

const styles = StyleSheet.create({
    menuButton: {
      marginLeft: 10,
    },
});

export default SMSStackScreen;