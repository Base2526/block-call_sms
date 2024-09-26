import React, { useState, useLayoutEffect, useEffect } from 'react';
import { SafeAreaView, Button, StyleSheet, View, TouchableOpacity, Text, Image, Modal, ActivityIndicator } from 'react-native';

const LoadingDialog = ({ visible }: { visible: boolean }) => {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={() => {}}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </Modal>
    );
};

const styles = StyleSheet.create({  
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    activityIndicatorWrapper: {
      backgroundColor: '#FFFFFF',
      height: 100,
      width: 100,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: '#000',
    },
});
  
export default LoadingDialog;
  