import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';

const PrivatePolicy: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading1}>Privacy Policy</Text>
      <Text style={styles.paragraph}>Effective Date: 15 September 2024</Text>

      <Text style={styles.paragraph}>
        This privacy policy explains how our mobile application ("the App")
        collects, uses, and protects your information when you use the App to
        block phone calls and SMS messages.
      </Text>

      <Text style={styles.heading2}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>The App may collect the following information:</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>
          - Phone call and SMS data: We may access certain data related to your
          incoming and outgoing phone calls and SMS messages in order to provide
          blocking functionality. This includes phone numbers and timestamps.
        </Text>
        <Text style={styles.listItem}>
          - Device information: We may collect non-personal information about
          your device, such as the device model, operating system, and app version.
        </Text>
      </View>

      <Text style={styles.heading2}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        The information we collect is used solely to provide the App’s
        functionality, which includes blocking unwanted phone calls and SMS
        messages. We do not store or share any personal information, phone numbers,
        or SMS content with third parties.
      </Text>

      <Text style={styles.heading2}>3. Data Security</Text>
      <Text style={styles.paragraph}>
        We are committed to protecting your data. The App does not store any personal
        data outside your device. All actions related to blocking calls and SMS
        messages occur locally on your device, and no sensitive information is
        transmitted to our servers or third parties.
      </Text>

      <Text style={styles.heading2}>4. Permissions</Text>
      <Text style={styles.paragraph}>
        The App requires certain permissions on your device, including:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>
          - <Text style={styles.bold}>Phone access:</Text> To monitor and block incoming
          and outgoing phone calls as per your preferences.
        </Text>
        <Text style={styles.listItem}>
          - <Text style={styles.bold}>SMS access:</Text> To block SMS messages from
          specific numbers or based on your settings.
        </Text>
      </View>

      <Text style={styles.heading2}>5. Changes to this Privacy Policy</Text>
      <Text style={styles.paragraph}>
        We may update this privacy policy from time to time. Any changes will be
        posted in the App, and we encourage you to review the privacy policy
        regularly to stay informed.
      </Text>

      <Text style={styles.heading2}>6. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about this privacy policy, please contact us at:
      </Text>
      <Text
        style={styles.link}
        onPress={() => Linking.openURL('mailto:blockcall@gmail.com')}>
        Email: blockcall@gmail.com
      </Text>

      <Text style={styles.paragraph}>
        By using the App, you agree to the terms of this privacy policy.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  heading2: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 15,
  },
  list: {
    marginBottom: 15,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginLeft: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default PrivatePolicy;