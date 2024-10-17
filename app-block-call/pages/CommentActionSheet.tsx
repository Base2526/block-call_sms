// CommentActionSheet.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';

type MyActionSheetProps = {
  actionSheetRef: React.RefObject<ActionSheet>;
};

const CommentActionSheet: React.FC<MyActionSheetProps> = ({ actionSheetRef }) => {
  return (
    <ActionSheet 
        ref={actionSheetRef} 
        gestureEnabled
        containerStyle={styles.actionSheetContainer}
        indicatorStyle={styles.indicator}  // Style for the draggable indicator
        defaultOverlayOpacity={0.3}>
        <View style={styles.container}>
          <Text style={styles.title}>Comments</Text>
        </View>
    </ActionSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 5,
    // backgroundColor: 'gray',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },

  actionSheetContainer: {
    height: '90%',//SCREEN_HEIGHT * 0.8,  // Max height for the sheet
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default CommentActionSheet;
