import React from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose, title }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose} // For Android back button support
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="times" size={25} color="#000" />
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          <Text style={styles.text}>AboutModal</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  searchContainer: {
    marginTop: 60, // Adjust this margin to avoid overlapping with the close button
    marginBottom: 40,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#F0F0F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').width * 0.5,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#A3A3A3',
    textAlign: 'center',
  },
});

export default AboutModal;
