import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useToast } from "react-native-toast-notifications";
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client';
import { launchImageLibrary } from 'react-native-image-picker'; // Import image picker

import {ReactNativeFile} from 'apollo-upload-client';

import { updateUser, resetUser } from "../redux/slices/userSlice"
import { getHeaders } from "../utils";
import { mutation_profile, mutation_uploadfile } from "../gqlQuery";
import { RootState, AppDispatch } from '../redux/store';

import LoadingDialog from "../LoadingDialog"

const ProfileScreen: React.FC<any> = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state: RootState) => state.user );

  const [onProfile] = useMutation(mutation_profile, {
    context: { headers: getHeaders(user.sessionId) },
    update: (cache, { data: { profile } }) => {
      if (profile.status) {
        dispatch(updateUser(profile.data));
      }
      setLoading(false);
    },
    onError(error) {
      console.error("onError:", error);

      setLoading(false);
    }
  });

  const openImageGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.error('Image picker error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const assets = response.assets[0];

          let file = new ReactNativeFile({
                                            uri: assets.uri,
                                            name: assets.fileName,
                                            type: assets.type,
                                          })

          onProfile({variables:{ input:  { mode: "update_image_profile",  file } }});

          setLoading(true);
        }
      }
    );
  };

  return (
      <View style={styles.container}>
        <LoadingDialog visible={loading} />
        <View style={styles.header}>
          <Image 
            source={require("../assets/banner-image.png")}
            style={styles.bannerImage} 
            resizeMode="cover" 
          />
          <View style={styles.profileContainer}>
            {
              user.user?.avatar
              ? <Image
                  source={{ uri: `http://192.168.1.3:1984/${ user.user?.avatar?.url }` }} 
                  style={{ width: 80, height: 80, borderRadius: 40, borderWidth: .5, borderColor:'gray' }}
                  resizeMode="cover" 
                />
              : <MaterialCommunityIcons name="account" size={80} color="#aaa" style={styles.profileImage}  />
            }
            <TouchableOpacity style={styles.editIconContainer} onPress={openImageGallery}>
              <MaterialCommunityIcons name="pencil" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Display name</Text>
            <Text style={styles.value}>{user.user?.current.displayName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status message</Text>
            <Text style={styles.value}>Build your money.</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone number</Text>
            <Text style={styles.value}>+66 62 958 0897</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>ID</Text>
            <View style={styles.idContainer}>
              <Text style={styles.value}>maiamili</Text>
              <TouchableOpacity onPress={() => {/* Handle copy action */}}>
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Allow others to add me by ID</Text>
            <Switch value={true} onValueChange={() => {/* Handle switch change */}} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>QR code</Text>
            <TouchableOpacity onPress={() => {/* Handle QR code view */}}>
              <Text style={styles.qrText}>View QR Code</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={async()=>{
            dispatch(resetUser());

            toast.show("Logout success.", {
              type: "success",
              placement: "bottom",
              duration: 4000,
              animationType: "slide-in",
            });

            navigation.goBack();
          }}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 150,
  },
  profileContainer: {
    width: 80,
    height: 80,
    bottom: -20,
    position: 'absolute',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  infoContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: 10,
    color: '#007AFF',
  },
  qrText: {
    color: '#007AFF',
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;