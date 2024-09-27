import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch } from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(false);

  const toggleAutoSync = () => setIsAutoSyncEnabled(!isAutoSyncEnabled);
  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default SettingsScreen;
