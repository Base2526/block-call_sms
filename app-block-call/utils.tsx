import AsyncStorage from '@react-native-async-storage/async-storage';
// import DeviceInfo from 'react-native-device-info';

import { useAppContext } from './context/DataContext';

import _ from "lodash"

// Function to save an object by name
export const saveObject = async (name: string, object: any) => {
    try {
      const jsonValue = JSON.stringify(object);
      await AsyncStorage.setItem(name, jsonValue);
      console.log(`${name} saved successfully.`);
    } catch (e) {
      console.error('Error saving object:', e);
    }
};

export const getObject = async (name: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(name);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error retrieving object:', e);
      return null;
    }
};

export const getDate = (timestamp: string, format: string = 'MM/DD'): string => {
  const today = new Date(timestamp);
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero
  const year = today.getFullYear();
  const date = today.getDate().toString().padStart(2, '0'); // Add leading zero
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = today.getHours().toString().padStart(2, '0'); // Add leading zero
  const minutes = today.getMinutes().toString().padStart(2, '0'); // Add leading zero
  const day = dayNames[today.getDay()]; // Get the day name (e.g., 'Thu')

  switch (format) {
    case 'DD/MM':
      return `${date}/${month}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${date}`;
    case 'YYYY/MM/DD Day HH:mm':
      return `${year}/${month}/${date} ${day} ${hours}:${minutes}`;
    default: // 'MM/DD'
      return `${month}/${date}`;
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  return `${day}/${month}`;
};

// const fetchDeviceInfo = () => {
//   const info = {
//     uniqueId: DeviceInfo.getUniqueId(),
//     manufacturer: DeviceInfo.getManufacturer(),
//     model:  DeviceInfo.getModel(),
//     brand:  DeviceInfo.getBrand(),
//     systemName:  DeviceInfo.getSystemName(),
//     systemVersion:  DeviceInfo.getSystemVersion(),
//     buildId:  DeviceInfo.getBuildId(),
//     bundleId:  DeviceInfo.getBundleId(),
//     appVersion:  DeviceInfo.getVersion(),
//     appBuildNumber:  DeviceInfo.getBuildNumber(),
//     deviceId:  DeviceInfo.getDeviceId(),
//     deviceType:  DeviceInfo.getDeviceType(),
//     isEmulator:  DeviceInfo.isEmulator(),
//     isTablet:  DeviceInfo.isTablet(),
//     // Add more device info methods here if needed
//   };

//   return info;
// };

export const getHeaders = () => {
  let { state } = useAppContext()
  const headers = {
      "apollo-require-preflight": "true",
      "content-Type": "application/json",
      "authorization": state.sessionId ? `Bearer ${state.sessionId}` : '',
      "custom-location": JSON.stringify({}),
      "custom-authorization": state.sessionId ? `Bearer ${state.sessionId}` : '',
  };

  return headers;
};
