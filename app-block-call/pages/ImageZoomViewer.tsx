import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

type ImageZoomViewerProps = {
  images: { url: string }[];
  isVisible: boolean;
  onClose: () => void;
};

const ImageZoomViewer: React.FC<ImageZoomViewerProps> = ({ images, isVisible, onClose }) => {
  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.container}>
        {/* Image Viewer */}
        <ImageViewer 
            imageUrls={images}
            enableSwipeDown
            onSwipeDown={ () => onClose() }
            onCancel={ () => onClose() } />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
           <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Slight background transparency
    position: 'relative', // Ensure relative positioning for close button
  },
  closeButton: {
    position: 'absolute',
    top: 25, // Position at the top
    right: 20, // Align to the right
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Button background transparency
    borderRadius: 20,
    padding: 10,
    zIndex: 1, // Ensure the button stays on top
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ImageZoomViewer;