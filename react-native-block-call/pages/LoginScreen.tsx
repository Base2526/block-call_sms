import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps>  = ({ onLogin }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login & verify to enhance your Whoscall experience</Text>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletNumber}>1</Text>
          </View>
          <Text style={styles.featureText}>One-click login and verify your phone number</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletNumber}>2</Text>
          </View>
          <Text style={styles.featureText}>Customized blocking list and report record</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.buttonFacebook} onPress={onLogin}>
        <Text style={styles.buttonText}>Sign up with Facebook</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.buttonGoogle}>
        <Text style={styles.buttonText}>Sign up with Google</Text>
      </TouchableOpacity>
      
      <Text style={styles.agreementText}>
        Logging in indicates that you agree to our{' '}
        <Text style={styles.linkText}>Privacy Policy</Text> /{' '}
        <Text style={styles.linkText}>Terms of Service</Text>.
      </Text>
{/*       
      <Image 
        source={require('./path/to/your/illustration.png')} // Add your image path here
        style={styles.bottomImage}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AAA',
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    // justifyContent: 'center',
    // marginTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#00A500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
  },
  buttonFacebook: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonGoogle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  linkText: {
    color: '#00A500',
  },
  bottomImage: {
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});

export default LoginScreen;