import React, { useEffect, useState, ReactNode }from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, NativeModules, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Chat, MessageType, defaultTheme, TextMessage } from '@flyerhq/react-native-chat-ui'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ItemSms } from "../redux/interface"
const { DatabaseHelper } = NativeModules;

// For the testing purposes, you should probably use https://github.com/uuidjs/uuid
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r % 4) + 8
    return v.toString(16)
  })
}

const SMSDetailModal: React.FC<any> = ({ route, navigation }) => {
  const { thread_id, number } = route.params;
  const [datas, setDatas] = useState<ItemSms[]>([]);

  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const user = { id: '06c33e8b-e835-4736-80f4-63f44b66666c', firstName: "A1" }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: number, // You can set any dynamic title here
    });
  }, [navigation, number]);

  useEffect(()=>{
    console.log("SMSDetailModal : ", thread_id)
    try {
      if(thread_id){
        DatabaseHelper.fetchSmsMessagesByThreadId(thread_id).then((response: any) => {
          setDatas(response);
        })
        .catch((error: any) =>{
          console.error("response @:", error)
        } );
      }
      
    } catch (error) {
      console.error("Error fetching SMS messages: ", error);
    }
  }, [])

  useEffect(()=>{
      if(datas){
        let newMessages: MessageType.Any[] = [];
        datas.map((item : ItemSms)=>{
          console.log(">> ", item)
          switch(Number(item.type)){
            // recevier
            case 1:{
              let author = { id: item.id, firstName: item.address }
              const textMessage: MessageType.Text = {
                author,
                createdAt: Date.now(),
                id: uuidv4(),
                text: item.body,
                type: 'text',
                // status
              }
              // "status": "-1"
              newMessages = [...newMessages, textMessage];
              break;
            }

            // sender
            case 2:{
              const textMessage: MessageType.Text = {
                author: user,
                createdAt: Date.now(),
                id: uuidv4(),
                text: item.body,
                type: 'text',
                status: 'seen' // 'delivered' | 'error' | 'seen' | 'sending' | 'sent'
              }
              newMessages = [...newMessages, textMessage];
              break;
            }

            default:
              break;
          }
        })
        setMessages(newMessages)
      }
  }, [datas])

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
      status: 'sending'
    }
    addMessage(textMessage)
  }

  const renderBubble = ({
    child,
    message,
    nextMessageInGroup,
  }: {
    child: ReactNode
    message: MessageType.Any
    nextMessageInGroup: boolean
  }) => {

    // const isCurrentUser = user.id === message.author.id;
    // const textStyle: TextStyle = {
    //   color: isCurrentUser ? 'blue' : 'black', // Customize text color based on the user
    // };
    // // Clone the child element to inject custom text style
    // const modifiedChild = React.cloneElement(child as React.ReactElement<any>, {
    //   // enableAnimation: true,
    // });
    // // console.log("message.author.id ", message.author.id, child, modifiedChild)

    if ( user.id === message.author.id ){
      return (
        <View
          style={{
            backgroundColor: '#000',
            borderBottomRightRadius: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20
          }}
        >{child}</View>
      )
    }
    return (
      <View
        style={{
          backgroundColor: '#eee',
          borderBottomRightRadius: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 0
        }}
      >{child}</View>
    )
  }

  const customDateHeaderText = (dateTime: number) => {
    const date = new Date(dateTime);
  // return date.toDateString(); // Example implementation
    return `${date.toDateString()}`
  }

  return (
    <SafeAreaProvider>
      <Chat
        theme={{
          ...defaultTheme,
          colors: { ...defaultTheme.colors, 
                    inputBackground: '#eee', 
                    inputText: '#888888'
                  },
        }}
        customDateHeaderText={customDateHeaderText}
        renderBubble={renderBubble}
        messages={messages}
        onSendPress={handleSendPress}
        user={user}
        showUserAvatars={true}
        showUserNames={true}
      />
    </SafeAreaProvider>
  );
};

export default SMSDetailModal;