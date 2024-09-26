import React from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const HelpSendFeedbackScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text>HelpSendFeedbackScreen</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  }
});

export default HelpSendFeedbackScreen;
