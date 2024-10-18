import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen: React.FC = () => {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(false);

  const toggleAutoSync = () => setIsAutoSyncEnabled(!isAutoSyncEnabled);
  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);

  return (
    <View style={styles.container}>
      <List.Section title="">
        <List.Item
          title="โพสต์ของฉัน"
          description="โพสต์ของฉันทั้งหมด"
          onPress={()=>{console.log("โพสต์ของฉันทั้งหมด")}}
          right={() => (
            <Icon name="chevron-right" size={24} color="gray" />
          )}
        />
        <List.Item
          title="รายการโพสต์ที่ฉันชอบ"
          description="รายการโพสต์ที่ฉันชอบทั้งหมด"
          onPress={()=>{console.log("รายการโพสต์ที่ฉันชอบทั้งหมด")}}
          right={() => (
            <Icon name="chevron-right" size={24} color="gray" />
          )}
        />
        <List.Item
          title="รายการบล็อก เบอร์ & SMS"
          description="รายการบล็อกทั้งหมด"
          onPress={()=>{console.log("รายการบล็อกทั้งหมด")}}
          right={() => (
            <Icon name="chevron-right" size={24} color="gray" />
          )}
        />
        {/* chevron-right */}  
      </List.Section>
      <List.Section title="Settings">
        <List.Item
          title="Auto Sync"
          description="Automatically sync your data"
          right={() => (
            <Switch value={isAutoSyncEnabled} onValueChange={toggleAutoSync} />
          )}
        />
        <List.Item
          title="Enable Notifications"
          description="Receive notifications for updates"
          right={() => (
            <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />
          )}
        />
      </List.Section>
      <Divider />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    // backgroundColor: 'red',
  },
});

export default SettingsScreen;
