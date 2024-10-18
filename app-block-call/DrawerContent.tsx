import { View, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/core'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import _ from "lodash"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 

import { useMyContext } from './MyProvider'; 
import { RootState, AppDispatch } from './redux/store';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationProp<any>;
}

const DrawerContent: React.FC<MenuProps> = ({ isOpen, onClose, navigation }) => {
  if (!isOpen) return null;
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.user.user );

  const { openLoginModal } = useMyContext();
  return (
      <TouchableWithoutFeedback onPress={() => onClose()}>
        <View style={[styles.overlay, {marginTop: insets.top}]}>
          <TouchableWithoutFeedback>
            <View style={styles.drawerContent}>
              {
                _.isEmpty(user)
                ? 
                  <TouchableOpacity style={styles.buttonLogin} onPress={()=>{
                    openLoginModal();
                    onClose();
                  }}>
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Login</Text>
                    </View>
                  </TouchableOpacity>
                : <>
                    <TouchableOpacity
                      style={styles.drawerItem}
                      onPress={() => {
                        onClose();
                        navigation.navigate("Profile");
                      }}>
                      <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                          {
                            user?.avatar
                            ? <Image 
                                source={{ uri: `http://192.168.1.3:1984/${ user?.avatar?.url }`}}
                                style={{  width: 80, height: 80, borderRadius: 40, borderWidth: .5, borderColor:'gray' }} />
                            : <MaterialCommunityIcons name="account" size={40} color="#aaa" />
                          }
                        </View>
                        <View style={styles.profileInfo}>
                          <Text style={styles.profileName}>{user.current?.displayName}</Text>
                          <Text style={styles.profileEmail}>{user.current?.email}</Text>
                        </View> 
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.drawerItem}
                      onPress={() =>{ 
                        // navigation.navigate('Settings');
                        onClose();
                      }}>
                      <Icon name="bug" size={20} style={{padding: 10}} />
                      <Text style={styles.drawerItemText}>โพสต์ของฉัน</Text>
                    </TouchableOpacity>
                    <Divider />

                    <TouchableOpacity
                      style={styles.drawerItem}
                      onPress={() =>{ 
                        // navigation.navigate('Settings');
                        onClose();
                        // bookmark-outline
                      }}>
                      <MaterialCommunityIcons name="bookmark-outline" size={20} style={{padding: 10}} />
                      <Text style={styles.drawerItemText}>รายการโพสต์ที่ฉันชอบ</Text>
                    </TouchableOpacity>
                    <Divider />

                    <TouchableOpacity
                      style={styles.drawerItem}
                      onPress={() =>{ 
                        // navigation.navigate('Settings');
                        onClose();
                      }}>
                      <MaterialCommunityIcons name="block-helper" size={20} style={{padding: 10}} />
                      <Text style={styles.drawerItemText}>รายการบล็อก เบอร์ & SMS</Text>
                    </TouchableOpacity>
                    <Divider />

                    <TouchableOpacity
                      style={styles.drawerItem}
                      onPress={() =>{ 
                        navigation.navigate('Settings');
                        onClose();
                      }}>
                      <Icon name="cogs" size={20} style={{padding: 10}} />
                      <Text style={styles.drawerItemText}>ตั้งค่า</Text>
                    </TouchableOpacity>
                    <Divider />
                  </> 
              }
              <TouchableOpacity 
                style={styles.drawerItem}
                onPress={() =>{
                  navigation.navigate('Policy');
                  onClose();
                }}>
                <Icon name="user-shield" size={20} style={{padding: 10}} />
                <Text style={styles.drawerItemText}>เงื่อนไขการใช้งาน</Text>
              </TouchableOpacity>
              <Divider />
              <TouchableOpacity 
                style={styles.drawerItem}
                onPress={()=>{
                  navigation.navigate('About');
                  onClose();
                }}>
                <Icon name="question" size={20} style={{padding: 10}} />
                <Text style={styles.drawerItemText}>เกี่ยวกับฉัน</Text>
              </TouchableOpacity>
              <Divider />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 1000,
    justifyContent: 'flex-start',
    position: 'absolute', 
    top: 0,
    left: 0,
  },
  closeButton: {
    padding: 10,
    alignItems: 'flex-end',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  drawerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%',
    height: '100%',
    backgroundColor: 'white',
    borderRightWidth: .5,
    borderColor: '#ccc',
    zIndex: 1000,
    padding: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: 15,
    // padding: 10,
  },
  drawerItemText: {
    marginLeft: 15,
    fontSize: 18,
  },
  avatarContainer: {
    width: 70, // Width of the avatar container
    height: 70, // Height of the avatar container
    justifyContent: 'center', // Center avatar content vertically
    alignItems: 'center', // Center avatar content horizontally
    borderRadius: 25, // Ensure container is circular
    backgroundColor: '#f0f0f0', // Background color if no image
    marginRight: 15,
  },

  buttonLogin: {
    backgroundColor: '#ee2b29',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default DrawerContent;