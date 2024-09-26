import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

const AboutScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>About Us</Text>
      <Text style={styles.paragraph}>
        Welcome to the <Text style={styles.highlight}>Call & SMS Blocker App</Text>, your ultimate solution for managing unwanted phone calls and messages. Our mission is to provide users with a simple yet effective way to block spam, telemarketing, and other unwanted contacts.
      </Text>

      <Text style={styles.subtitle}>Our Purpose</Text>
      <Text style={styles.paragraph}>
        We understand how annoying and intrusive unwanted calls and messages can be. That's why we built this app to empower users with control over their communication. With our app, you can easily block numbers, filter unwanted SMS, and enjoy peace of mind.
      </Text>

      <Text style={styles.subtitle}>Features</Text>
      <View>
        <Text style={styles.listItem}>• Block unwanted calls and SMS from specific numbers.</Text>
        <Text style={styles.listItem}>• Auto-detect and block spam calls and messages.</Text>
        <Text style={styles.listItem}>• Keep a log of blocked calls and messages for review.</Text>
        <Text style={styles.listItem}>• Customizable blocking settings for enhanced flexibility.</Text>
      </View>

      <Text style={styles.subtitle}>Why Choose Us?</Text>
      <Text style={styles.paragraph}>
        Our app is designed to be user-friendly, lightweight, and powerful. We continuously update it to ensure compatibility with the latest devices and operating systems. Our support team is always ready to assist you with any issues or questions you may have.
      </Text>

      <Text style={styles.subtitle}>Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions or feedback, feel free to reach out to us. We value your input and are committed to improving your experience with the Call & SMS Blocker App.
      </Text>

      <Text style={styles.paragraph}>
        Thank you for choosing <Text style={styles.highlight}>Call & SMS Blocker App</Text>!
      </Text>
    </View>
  </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    // padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#ff5722',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 5,
  },
});

export default AboutScreen;