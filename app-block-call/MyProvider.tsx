import React, { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { useToast } from "react-native-toast-notifications";

import LoginModal from "./pages/LoginModal"

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