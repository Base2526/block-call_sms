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
import { useSelector } from 'react-redux';

import constants from './constants';
import MentionHashtag from "./MentionHashtag"
import { SubCommentInterface, StatusInterface, ReplyInterface } from "./interfaces"
import { RootState } from '../redux/store';

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
  reply,
  mainIndex,
  deleteInternalComment,
  setReply
}: {
  data: SubCommentInterface;
  index: number;
  reply: ReplyInterface;
  mainIndex: number;
  deleteInternalComment: Function;
  setReply: Function;
}) => {
  const [date, setDate] = useState(new Date());
  const {_id, text, created, user, status } = data;

  const current_user = useSelector((state: RootState) => state.user.user );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.top, { }]}
        onPress={()=>{ console.log("profile") }}>
         {
          user?.url 
          ? <TouchableOpacity style={styles.avatar}>
              <Image 
              source={{ uri: user?.url  }} 
              style={styles.avatar}
              resizeMode="cover" // or 'contain', depending on your needs
              />
            </TouchableOpacity>
          : <TouchableOpacity style={styles.avatar}>
              <Icon name="account" size={20} color="#333" />
            </TouchableOpacity>
          }
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.date}>
          {moment(new Date(created)).from(date)}
        </Text>
      </TouchableOpacity>
      <MentionHashtag
        style={[styles.mentionHashtag, 
          { backgroundColor: reply?.selectId === _id ? 'gray' : constants.colors.WHITE,
            borderRadius: reply?.selectId === _id ? 5 : 0, 
            padding: reply?.selectId === _id ? 5 : 0,
            color: '#000'
          }
        ]}
        mentionHashtagPress={(text)=>{console.log(" >", text)}}
        mentionHashtagColor={"#007BFF"}
        >{text}</MentionHashtag>
      {
            status == StatusInterface.SENT
            ? <View style={styles.detailsContainer}>
                <View style={styles.optionsArray}>
                  <TouchableOpacity
                    style={styles.reply}
                    onPress={() => {
                      setReply(`${ user.username } `, _id);
                    }}>
                    <Text style={styles.replyText}>{'REPLY'}</Text>
                  </TouchableOpacity>
                  {
                    current_user?._id === user.userId
                    ? <TouchableOpacity
                        style={styles.trash}
                        onPress={() => {
                            Alert.alert(
                              'Delete Comment?',
                              'Do you want to delete this comment',
                              [
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () => {
                                    deleteInternalComment(_id);
                                  },
                                },
                                {
                                  text: 'Cancel',
                                },
                              ],
                            );
                        }}>
                        <Icon name="trash-can" size={20} color="#333" />
                      </TouchableOpacity>
                    : <></>
                  }
                  
                </View>
              </View>
            : status == StatusInterface.SENDING 
              ? <View style={styles.detailsContainerStutus}> 
                  <View style={styles.optionsStatus}><Text style={{fontSize: 12, fontWeight: '500'}}>{StatusInterface.SENDING}...</Text></View>
                </View>
              : <View style={styles.detailsContainerStutus}> 
                  <TouchableOpacity >
                    <Text style={{fontSize: 12, fontWeight: '500', color:'red'}}>{StatusInterface.FAILED}</Text>
                    {/* <Icon name="account" size={20} color="#333" />  */}
                  </TouchableOpacity>
                </View>
          }
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: constants.colors.WHITE,
    padding: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentionHashtag:{
    marginLeft: 40,
  },
  username: {
    fontSize: constants.fontSizes.username,
    fontWeight: '600',
    marginLeft: 10,
    textAlign: 'right',
  },
  replyingTo: {
    fontSize: constants.fontSizes.comment,
    fontWeight: '200',
  },
  body: {
    fontSize: constants.fontSizes.comment,
    fontWeight: '400',
    marginVertical: 10,
    lineHeight: constants.fontSizes.comment + 6,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailsContainerStutus: {
    flexDirection: 'row',
    marginLeft: 40,
  },
  date: {
    fontSize: 12,
    marginLeft: 5,
  },
  replyText: {
    fontWeight: '400',
    fontSize: 13,
    marginLeft: 7,
  },
  reply: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  optionsArray: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trash: {
    // marginLeft: 10,
  },
});
export default SubComment;