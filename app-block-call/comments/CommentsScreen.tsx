import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, TextInput, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { faker } from '@faker-js/faker';
import _ from "lodash"
import useComments from './useComments';
import KeyboardStickyView from "./KeyboardStickyView"
import MainComment from './MainComment';

import generateComments  from "./faker"

import constants from "./constants";

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
  const [comments, setComments] = useState(generateComments(20));

  const [replyId, setReplyId] = useState('')
  const [tags, setTags] = useState('')

  // const handleSaveAction = (text: string, parentId: string | false) => {
  //   console.log('Saving comment:', text, 'Parent ID:', parentId);
  // };
  // console.log("CommentsScreen :", comments)

  const sendComment1 = () => {
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

  // Function to remove a comment by _id
  const removeComment = (_id: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== _id)
    );
  };

  // Function to remove a sub-comment by its _id
  const removeSubComment = (commentId: string, subCommentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              subComments: comment.subComments.filter(
                (subComment) => subComment._id !== subCommentId
              ),
            }
          : comment
      )
    );
  };

    // Function to add a subcomment to the comment with _id '44205eee-6c96-42b9-a4fe-a6677b100470'
  const sendComment = () => {

    if( !_.isEmpty(replyId) ){
      const newSubComment: SubComment = {
        _id: faker.string.uuid(),
        comment: message,
        timestamp: Date.now(),
        username: faker.internet.userName(),
        secondReply: null, // Can be filled with data if needed
      };
  
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === replyId
            ? {
                ...comment,
                exposed: true,
                subComments: [...comment.subComments, newSubComment],
              }
            : comment
        )
      );

      setReplyId("")
      setMessage("")
      setTags("")
    }else{
      const newCommentObject: Comment = {
        _id: faker.string.uuid(),
        comment: message,
        timestamp: Date.now(),
        username: 'NewUser', // Replace with actual username if needed
        exposed: false,
        subComments: [],
      };
  
      setComments((prevComments) => [...prevComments, newCommentObject]);

      setMessage("")
    }
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
                  setReply={(_id: string, tags: string)=>{
                    console.log("Reply :", _id)
                    setReplyId(_id)
                    setMessage(tags)

                    setTags(tags)
                  }}
                  deleteComment={(commentId: string) => {
                    removeComment(commentId);
                  }}
                  deleteInternalComment={(commentId: string, subCommentId: string) => {
                    removeSubComment(commentId, subCommentId)
                  }}
                />
              );
            }}
          />
        </View>
       
      </View>
      <KeyboardStickyView style={{borderWidth: .5, borderColor: 'gray'}}>
        {
          !_.isEmpty(replyId) 
          ? <View style={{height: 40, 
              width:'100%', 
              backgroundColor: '#eee', 
              // justifyContent:'center',
              alignItems:'center', 
              flexDirection: 'row',
              justifyContent: 'space-between'
              }}>
              <View style={{flexDirection:'row', marginLeft: 10}}>
                <Text style={{fontSize: 16}}>Replying to { tags }</Text>
              </View>
              <TouchableOpacity 
                style={{flexDirection:'row'}}
                onPress={()=>{ 
                  setTags("")
                  setReplyId("")
                  setMessage("")
                 }}>
                <Icon name="close" size={15} color={ "#333" } style={{ padding: 10}}/>
              </TouchableOpacity>
            </View>
          : <></>
        }
        
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
            <Icon name="send" size={24} color={ _.isEmpty(message) ? "#333" : '#007BFF' }/>
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
    backgroundColor: constants.colors.WHITE,
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