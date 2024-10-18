import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

import constants from './constants';
import MentionHashtag from "./MentionHashtag"

interface subcomment {
  _id: string;
  comment: string;
  timestamp: number;
  username: string;
  replyToUsername: string;
  secondReply: string | null;
}

/**
 * Subcomment component
 * @param {subcomment} data - An object for the sub component
 * @param {number} index - The index of the subcomment
 * @param {number} mainIndex - The index of the main comment
 * @param {Function} deleteInternalComment - Function to delete the comment
 * @returns Renderable component
 */
const SubComment = ({
  data,
  index,
  mainIndex,
  deleteInternalComment,
  setReply
}: {
  data: subcomment;
  index: number;
  mainIndex: number;
  deleteInternalComment: Function;
  setReply: Function;
}) => {
  // const {setReplyData} = useReply();
  // const {username: signedInUserName} = useUsername();
  const [date, setDate] = useState(new Date());
  const {_id, comment, timestamp, username, replyToUsername, secondReply} = data;
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity style={styles.avatar}>
          <Icon name="account" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.username}>
          {username} 
          {/* <Text style={styles.replyingTo}>{` replying to `}</Text>
          {replyToUsername}
          {secondReply && (
            <>
              <Text style={styles.replyingTo}>{`\n and `}</Text>
              {secondReply}
            </>
          )} */}
        </Text>
        <Text style={styles.date}>
          {moment(new Date(timestamp)).from(date)}
        </Text>
      </View>
      <MentionHashtag
        style={{marginLeft: 40}}
        mentionHashtagPress={(text)=>{console.log(" >", text)}}
        mentionHashtagColor={"#007BFF"}
        >{comment}</MentionHashtag>
      <View style={styles.detailsContainer}>
        {/* <Text style={styles.date}>
          {moment(new Date(timestamp)).from(date)}
        </Text> */}
        <View style={styles.optionsArray}>
          <TouchableOpacity
            style={styles.reply}
            onPress={() => {
              // setReplyData({
              //   replyToMain: false,
              //   index: index,
              //   mainIndex: mainIndex,
              //   replyToUsername: replyToUsername,
              //   secondReply: username,
              // });
              setReply(username)
            }}>
           {/* <Icon name="reply" size={24} color="#333" /> */}
            <Text style={styles.replyText}>{'REPLY'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.trash}
            onPress={() => {
              // if (signedInUserName == username)
                Alert.alert(
                  'Delete Comment?',
                  'Do you want to delete this comment',
                  [
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        deleteInternalComment(_id);

                        // console.log(">> ", _id)
                      },
                    },
                    {
                      text: 'Cancel',
                    },
                  ],
                );
              // else
              //   Alert.alert(
              //     `Change your username to "${username}" to delete this comment`,
              //   );
            }}>
            <Icon name="trash-can" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    // alignItems: 'center',
    backgroundColor: constants.colors.WHITE,
    padding: 5,
    // marginTop: 5,
    // borderLeftWidth: 5,
    // borderColor:'gray',
    // borderWidth: .5,
    borderColor: constants.colors.GREY,
  },
  avatar: {
    borderColor: constants.colors.GREY,
    borderWidth: .5,
    height: 30,
    width: 30,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  top: {
    // backgroundColor: 'blue',
    // width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: constants.fontSizes.username,
    fontWeight: '600',
    marginLeft: 10,
    // top: 5,
    textAlign: 'right',
  },
  replyingTo: {
    fontSize: constants.fontSizes.comment,
    fontWeight: '200',
  },
  body: {
    fontSize: constants.fontSizes.comment,
    fontWeight: '400',
    // width: '80%',
    marginVertical: 10,
    lineHeight: constants.fontSizes.comment + 6,
  },
  detailsContainer: {
    // width: '80%',
    // backgroundColor: 'blue',
    flexDirection: 'row',
    // alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // marginTop: 10,
    //  marginBottom: 20,
  },
  date: {
    // fontWeight: '500',
    fontSize: 12,
    marginLeft: 5,
  },
  replyText: {
    fontWeight: '400',
    fontSize: 13,
    marginLeft: 7,
  },
  reply: {
    // padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsArray: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trash: {
    // padding: 5,
    marginLeft: 10,
  },
});
export default SubComment;