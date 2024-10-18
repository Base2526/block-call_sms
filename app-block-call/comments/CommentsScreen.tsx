import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, TextInput, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommentInput from './CommentInput';
import useComments from './useComments';
import KeyboardStickyView from "./KeyboardStickyView"
import MainComment from './MainComment';

import generateComments  from "./faker"

interface SubComment {
  _id: string;
  comment: string;
  timestamp: number;
  username: string;
  secondReply: string | null;
}

interface Comment {
  _id: string;
  comment: string;
  timestamp: number;
  username: string;
  exposed: boolean;
  subComments: Array<SubComment>;
}

const CommentsScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState(generateComments(30));

  const handleSaveAction = (text: string, parentId: string | false) => {
    console.log('Saving comment:', text, 'Parent ID:', parentId);
  };

  // console.log("CommentsScreen :", comments)

  const sendComment = () => {
    console.log("sendComment :", message)
    /*
    if (Object.keys(reply).length === 0) {
      const comment = {
        comment: message,
        timestamp: new Date().getTime(),
        username: username,
        subComments: [],
      };
      let newcomments = [...comments];
      newcomments.unshift(comment);
      setCommentData(newcomments);
    } else {
      if (reply?.replyToMain) {
        const index = reply?.index;
        const replyToUsername = reply?.replyToUsername;
        const comment = {
          comment: message,
          timestamp: new Date().getTime(),
          username: username,
          replyToUsername: replyToUsername,
        };
        let newcomments = [...comments];
        newcomments[index].subComments.push(comment);
        setCommentData(newcomments);
      } else {
        const index = reply?.index;
        const mainIndex = reply?.mainIndex;
        const replyToUsername = reply?.replyToUsername;
        const secondReply = reply?.secondReply;

        const comment = {
          comment: message,
          timestamp: new Date().getTime(),
          username: username,
          replyToUsername: replyToUsername,
          secondReply: secondReply,
        };
        let newcomments = [...comments];
        newcomments[mainIndex].subComments.push(comment);
        setCommentData(newcomments);
      }
    }
      */
  };

  const setExposedById = (_id: string, exposed: boolean) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === _id
          ? { ...comment, exposed } // Set exposed to true for the matching _id
          : comment
      )
    );
  };

  return (
    <View>
      {/* Wrap everything in a single parent view */}
      <View style={styles.container}>
        {/* <Text style={styles.title}>{`COMMENTS`}</Text> */}
        <View style={styles.containerSafe}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            initialNumToRender={10}
            maxToRenderPerBatch={10} // Number of items to render per batch
            updateCellsBatchingPeriod={50} // Time (in ms) between batch rendering
            removeClippedSubviews={true}
            renderItem={({item, index}) => {
              return (
                <MainComment
                  key={index}
                  index={index}
                  data={item}
                  setExposed={(_id: string, exposed: boolean)=>{
                    setExposedById(_id, exposed)
                  }}
                  deleteComment={() => {
                    // deleteComment(index);
                  }}
                  deleteInternalComment={(value: number) => {
                    // deleteInternalComment(index, value);
                  }}
                />
              );
            }}
          />
        </View>
       
      </View>
      <KeyboardStickyView style={{borderWidth: .5, borderColor: 'gray'}}>
        <View style={{flexDirection:'row'}}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => {console.log(">")}}
            placeholder="Write comment..."
            multiline
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={()=>{ sendComment() }}>
            <Icon name="send" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </KeyboardStickyView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // height: '100%',
    flexDirection: 'column',
    // alignItems: 'center',
    // paddingBottom: 150,
    // backgroundColor:'yellow'
  },
  containerSafe: {
    width: '100%',
    height: '100%',
    paddingBottom: 45,
    // backgroundColor: 'green'
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: '1%',
    marginBottom: 10,
  },
  textInput: {
    flex: 1, // Take available space
    backgroundColor: 'white', // Background color for the input
    // padding: 10, // Padding inside the input
    // marginRight: 10, // Space between the input and button
    minHeight: 40, // Minimum height
    maxHeight: 120, // Maximum height
  },
  sendButton: {
    justifyContent: 'center', // Center the icon horizontally
    alignItems: 'center', // Center the icon vertically
    padding: 10, // Padding around the icon
    // borderRadius: 5, // Rounded corners for the button
    backgroundColor: 'gray'
  },
});

export default CommentsScreen;