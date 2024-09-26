import PushNotification, { PushNotificationObject } from "react-native-push-notification";
import { useEffect } from 'react';
import { Linking } from 'react-native';

const NotificationHandler = () => {

  useEffect(() => {
    // Configure Push Notification
    PushNotification.configure({
      onNotification: function (notification :any) {
        console.log("NOTIFICATION:", notification);
        if (notification.userInteraction) {
          // When the user taps on the notification
          handleNotificationIntent(notification);
        }
      },
    });

    // Listen for any deep linking from notifications
    // Linking.addEventListener('url', (event) => {
    //   console.log("Linking URL:", event.url);
    //   // Handle the intent when app is opened via notification link
    //   handleNotificationIntentFromUrl(event.url);
    // });

    const handleOpenURL = (event: { url: string }) => {
        console.log('URL opened:', event.url);
        handleNotificationIntentFromUrl(event.url);
      };

    const subscription = Linking.addEventListener('url', handleOpenURL);

    return () => {
      // Clean up listeners when component unmounts
      subscription.remove();
    };
  }, []);

  // Handle notification when user taps on it
  const handleNotificationIntent = (notification: PushNotificationObject) => {
    const { data } = notification;
    if (data && data.intentAction) {
      console.log('Handling notification intent:', data.intentAction);
      // Navigate to a specific screen or perform an action based on intentAction
    }
  };

  // Handle app opening via deep link from notification
  const handleNotificationIntentFromUrl = (url: string) => {
    // Parse the URL and handle navigation or actions based on URL
    console.log('Handling deep link from notification:', url);
  };

  return null;
};

export default NotificationHandler;
