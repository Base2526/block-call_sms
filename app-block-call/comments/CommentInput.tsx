import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import constants from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useReply from './useReply';

/**
 * Input Component for chats
 * @param {string} placeholder - the placeholder of the textinput
 * @param {Function} onChangeText - the function to handle changes to value
 * @param {Function} sendComment - the function to send comments to the store
 * @param {string} value - the value of the textinput
 * @returns Renderable component
 */

const CommentInput = ({
  placeholder,
  onChangeText,
  sendComment,
  value,
}: {
  placeholder: string;
  onChangeText: Function;
  sendComment: Function;
  value: string;
}) => {
  const {reply} = useReply();
  const inputRef = useRef<any>(null);
  const {setReplyData} = useReply();
  useEffect(() => {
    // if (Object.keys(reply).length === 0) return;
    inputRef?.current?.focus();
  }, [reply]);
  return (
    <KeyboardAvoidingView
      style={[styles.textInputContainer]}
      behavior={'padding'}
      keyboardVerticalOffset={60}>
      <TextInput
        ref={inputRef}
        style={styles.commentView}
        placeholder={placeholder}
        placeholderTextColor={constants.colors.GREY}
        value={value}
        textAlignVertical={'top'}
        onChangeText={(text: string) => {
          onChangeText(text);
        }}
        onSubmitEditing={() => {
          if (value.length != 0) {
            sendComment();
          }
        }}
        onBlur={() => {
          setReplyData({});
        }}
        returnKeyType={'send'}
      />
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  textInputContainer: {
    position: 'absolute',
    width: '100%',
    height: 120,
    backgroundColor: constants.colors.GREY,
    bottom: 0,
    zIndex: 2,
    elevation: 2,
    alignItems: 'center',
    paddingTop: 15,
  },
  commentView: {
    width: '95%',
    paddingHorizontal: 10,
    backgroundColor: constants.colors.WHITE,
    borderRadius: constants.borderRadius.input,
    height: 40,
  },
});
export default CommentInput;