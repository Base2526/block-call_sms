import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useSelector, useDispatch } from 'react-redux';
import  Toast from 'react-native-toast-notifications';
import { useMutation } from '@apollo/client';

import { RootState, AppDispatch } from '../redux/store';
import { setUser, resetUser } from "../redux/slices/userSlice"
import { mutation_login } from "../gqlQuery";
import { getHeaders } from "../utils";
import handlerError from "../handlerError";

interface LoginScreenProps {
  visible: boolean;
  onLoginSuccess: ({ name }: { name: string }) => void;
  closeLoginModal: () => void;
}

const LoginModal: React.FC<LoginScreenProps> = (props) => {
  let { onLoginSuccess, closeLoginModal, visible } = props
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state to toggle password visibility

  const dispatch: AppDispatch = useDispatch();
  const toastRef = useRef<Toast | null>(null);

  // dispatch(resetUser());
  // const user = useSelector((state: RootState) => state.user );
  // console.log("LoginModal :", user)

  const [onMutationLogin] = useMutation(mutation_login, {
    context: { headers: getHeaders() },
    update: (cache, {data: {login}}) => { 
      console.log("login :", login)

      let { status, sessionId, data } = login;
      if(status){
        console.log("login result :", sessionId, data)

        dispatch(setUser(data.current));

        if (toastRef.current) {
          toastRef.current.show("Login success.", {
            type: "success",
            placement: "bottom",
            duration: 4000,
            animationType: "slide-in",
          });
        }

        onLoginSuccess(data.current.displayName)

        closeModal()
      }
    },
    onCompleted( data ) {
      setLoading(false)
    },
    onError(error){
      if (toastRef.current) {
        handlerError(props, toastRef.current, error)
      }

      setLoading(false)
    }
  });


  const closeModal = () => {
    closeLoginModal();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const handleLogin = () => {
    let isValid = true;

    // Reset error messages
    setUsernameError('');
    setPasswordError('');

    if (username.trim() === '') {
      setUsernameError('Username is required.');
      isValid = false;
    }

    if (password.trim() === '') {
      setPasswordError('Password is required.');
      isValid = false;
    }

    // Proceed if valid
    if (isValid) {
      // onLogin(username, password);

      setLoading(true)
      onMutationLogin({ variables: { input: {username, password} } });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeLoginModal}
    >
    {/* ref={toastRef} */}
      <Toast ref={toastRef} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.title}>Login & verify to enhance your experience</Text>

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

            {/*
            <TouchableOpacity style={styles.buttonFacebook} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign up with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonGoogle}>
              <Text style={styles.buttonTextGoogle}>Sign up with Google</Text>
            </TouchableOpacity>

            <Text style={{fontSize:15, fontWeight: '500'}}>OR</Text>
            */}

            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              onFocus={()=>{  setUsernameError(''); }}
              onBlur={()=>{ console.log("onBlur") }}
            />
            {usernameError && <View style={{width: '100%'}}><Text style={styles.errorText}>{usernameError}</Text></View>}

             {/* Password Input */}
             <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Toggle password visibility
                autoCapitalize="none"
                onFocus={() => setPasswordError('')}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {passwordError && <View style={{width: '100%'}}><Text style={styles.errorText}>{passwordError}</Text></View>}


            {/* Login Button */}
            <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin} disabled={loading}>
                <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Login</Text>
                    {loading && <ActivityIndicator style={styles.loadingIndicator} size="small" color="#fff" />}
                </View>
            </TouchableOpacity>

            <Text style={styles.agreementText}>
              Logging in indicates that you agree to our{' '}
              <Text style={styles.linkText}>Privacy Policy</Text> /{' '}
              <Text style={styles.linkText}>Terms of Service</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 15
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
    fontSize: 14,
    color: '#333333',
    lineHeight: 24, // Adjust line height for better readability
    textAlign: 'left', // Align text as needed
  },
  buttonFacebook: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonGoogle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    color: '#fff',
    alignItems: 'center',
  },
  buttonLogin: {
    backgroundColor: '#ee2b29',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonTextGoogle:{
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 12,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  agreementText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#00A500',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '500',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
  loadingIndicator: {
    marginLeft: 10,
  },
});

export default LoginModal;