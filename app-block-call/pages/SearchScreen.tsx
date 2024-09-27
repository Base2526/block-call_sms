import React from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 


const SearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#C7C7CD" style={styles.icon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search keyword or number"
          placeholderTextColor="#C7C7CD"
        />
      </View>

      <View style={styles.imageContainer}>
        <Icon name="magnify" size={100} color="#aaa" style={styles.image} />
        <Text style={styles.text}>
          Find over millions of numbers here!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7C7CD',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginLeft: 30, // Adjusted margin to account for the icon width
    paddingRight: 10, // Add right padding to ensure text doesn't touch the edge
  },
  icon: {
    position: 'absolute',
    left: 15, // Positioned to ensure it aligns nicely within the container
  },
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
  imageContainer: {
    flex: 1, // Make sure it takes the available space
    alignItems: 'center',
    // justifyContent: 'center',
    marginTop: 20, // Optional: Add margin top if you want spacing from the search container
  },
  image: {
    width: 100, // Set fixed width for the icon
    height: 100, // Set fixed height for the icon
    resizeMode: 'contain',
  },
  text: {
    fontSize: 18,
    color: '#A3A3A3',
    textAlign: 'center',
    marginTop: 20, // Add margin top to separate the text from the icon
  },
});

export default SearchScreen;