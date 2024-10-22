import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import SubComment from './SubComment';
import MentionHashtag from "./MentionHashtag"
import constants from './constants';
import { CommentInterface, StatusInterface, ReplyInterface } from "./interfaces"

import { RootState } from '../redux/store';

/**
 * Main comment component
 * @param {object} data - Data containing the object
 * @param {number} index - Index of data
 * @param {function} setExposed - Function to exposed
 * @param {function} deleteComment - Function to delete main comment
 * @param {function} deleteInternalComment - Function to delete a subcomment
 * @returns Renderable component
 */

const MainComment = ({
  data,
  deleteComment,
  index,
  reply,
  deleteInternalComment,
  setExposed,
  setReply
}: {
  data: CommentInterface;
  deleteComment: Function;
  deleteInternalComment: Function;
  index: number;
  reply: ReplyInterface;
  setExposed: Function;
  setReply: Function;
}) => {
  const navigation = useNavigation();
  
  const [date, setDate] = useState(new Date());
  const {_id, text, created, user, exposed, status, subComments} = data;
  const current_user = useSelector((state: RootState) => state.user.user );

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.top, { }]}
          onPress={()=>{ 
            navigation.navigate("UserProfile" ,  { _id:  user?._id }  ) 
          }}>
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
          
          <Text style={[styles.username, { }]}>{user.username}</Text>
          <Text style={styles.date}>
            {moment(new Date(created)).from(date)}
          </Text>
        </TouchableOpacity>
        <MentionHashtag
          // style={{marginLeft: 40, backgroundColor:'gray', borderRadius: 5, padding: 5}}
          style={[styles.mentionHashtag, 
                  { backgroundColor: reply?.selectId === _id ? 'gray' : constants.colors.WHITE,
                    borderRadius: reply?.selectId === _id ? 5 : 0, 
                    padding: reply?.selectId === _id ? 5 : 0,
                    color: '#000'
                  }
                ]}
          mentionHashtagPress={(text)=>{console.log(" >", text)}}
          mentionHashtagColor={"#007BFF"}>{text}</MentionHashtag>
          {
            status == StatusInterface.SENT
            ? <View style={styles.detailsContainer}>
                <View style={styles.optionsArray}>
                  <TouchableOpacity
                    style={styles.reply}
                    onPress={() => {
                      setReply(_id, `@${ user.username } `, _id);
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
                                    deleteComment(_id);
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
      <View style={styles.subs}>
        <View style={styles.subCommentsView}>

            {
                subComments.length === 0
                ? <></>
                : exposed !== undefined && exposed 
                  ?   <View>
                          <FlatList
                              data={subComments}
                              keyExtractor={(item) => item._id}
                              initialNumToRender={10}
                              maxToRenderPerBatch={10} // Number of items to render per batch
                              updateCellsBatchingPeriod={50} // Time (in ms) between batch rendering
                              removeClippedSubviews={true}
                              //@ts-ignore
                              renderItem={({item, index_}: {item: any; index_: number}) => {
                              return (
                                  <SubComment
                                    key={index_}
                                    data={item}
                                    mainIndex={index}
                                    index={index_}
                                    reply={reply}
                                    setReply={(tag: string, selectId: string)=>{
                                      setReply(_id, `@${ tag } `, selectId);
                                    }}
                                    deleteInternalComment={(subCommentId: string) => {
                                      deleteInternalComment(_id, subCommentId);
                                    }}
                                  />
                              );
                              }}
                          />
                          <TouchableOpacity 
                              style={{ padding: 5 }}
                              onPress={()=>{
                                  setExposed(_id, false)
                              }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: '10%', height: 1.5, backgroundColor: '#eee', marginRight: 5 }} />
                                <Text style={{fontWeight: '500'}}>Hide replies</Text>
                              </View>
                          </TouchableOpacity>
                      </View>
                  :   <TouchableOpacity
                        style={{ padding: 5 }}
                        onPress={() => {
                          setExposed(_id, true);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: '10%', height: 1.5, backgroundColor: '#eee', marginRight: 5 }} />
                          <Text style={{ fontWeight: '500', color: 'gray' }}>
                            View {subComments.length} more replies
                          </Text>
                        </View>
                      </TouchableOpacity>
            }
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: constants.colors.WHITE,
    padding: 5,
    borderColor:'gray'
  },
  avatar: {
    borderColor: constants.colors.GREY,
    borderWidth: .5,
    height: 25,
    width: 25,
    borderRadius: 5,
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
    marginRight: 10
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
  subs: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  threadView: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '10%',
  },
  thread: {
    width: 5,
    height: '98%',
    backgroundColor: constants.colors.WHITE,
    borderRadius: 10,
  },
  subCommentsView: {
    width: '90%',
  },
});

export default MainComment;