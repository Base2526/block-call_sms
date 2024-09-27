import React, { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { useToast } from "react-native-toast-notifications";

import LoginModal from "./pages/LoginModal"
import NotificationHandler from './NotificationHandler'; 

const { DatabaseHelper } = NativeModules;

interface MyContextType {
    openLoginModal: () => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export const useMyContext = () => {
    const context = useContext(MyContext);
    if (context === undefined) {
        throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};
  
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false)
    const toast = useToast();


    const openLoginModal = () => {
      setVisible(true)
    };


    // useEffect(()=>{

    //   const eventEmitter = new NativeEventEmitter(DatabaseHelper);
      
    //   const subscription = eventEmitter.addListener('onSmsReceived', (data) => {
    //     // Handle the data from the notification (sender, messageBody)
    //     console.log('SMS Received:', data);
    //     // Use this data to navigate or update the UI
    //   });

    //   return () => subscription.remove();
    // }, [])
  
    return (
      <MyContext.Provider value={{ openLoginModal }} >
        {/* <NotificationHandler /> */}
        {children}
        {
          visible && <LoginModal 
                      onLoginSuccess={(name)=>{ 
                        console.log("current @@ name :", name)
                        toast.show(`Welcome ${ name } to Block Call & SMS.`, {
                          type: "success",
                          placement: "bottom",
                          duration: 6000,
                          animationType: "slide-in",
                        });
                       }} 
                      closeLoginModal={()=>{setVisible(false)}}
                      visible={visible}/>
        }
      </MyContext.Provider>
    );
};