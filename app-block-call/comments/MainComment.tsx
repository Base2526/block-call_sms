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

import constants from './constants';
import SubComment from './SubComment';
import MentionHashtag from "./MentionHashtag"

interface subcomment {
    _id: string;
    comment: string;
    timestamp: number;
    username: string;
    secondReply: string | null;
}
interface comment {
    _id: string;
    comment: string;
    timestamp: number;
    username: string;
    exposed: boolean;
    subComments: Array<subcomment>;
}

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
  deleteInternalComment,
  setExposed,
  setReply
}: {
  data: comment;
  deleteComment: Function;
  deleteInternalComment: Function;
  index: number;
  setExposed: Function;
  setReply: Function;
}) => {
  const [date, setDate] = useState(new Date());
  const {_id, comment, timestamp, username, exposed, subComments} = data;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.top}>
          <TouchableOpacity style={styles.avatar}>
            <Icon name="account" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.username}>{username}</Text>
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
          <View style={styles.optionsArray}>
            <TouchableOpacity
              style={styles.reply}
              onPress={() => {
                setReply(_id, `@${ username } `);
              }}>
              <Text style={styles.replyText}>{'REPLY'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
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
          </View>
        </View>
      </View>
      <View style={styles.subs}>
        {/* <View style={[styles.threadView, {height: threadHeight}]}>
          {threadHeight !== 0 && <View style={[styles.thread]} />}
        </View> */}
        <View style={styles.subCommentsView}>

            {
                subComments.length === 0
                ? <></>
                : exposed ? <View>
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
                                          setReply={(tags: string)=>{
                                            console.log("Reply :", _id)
                                            // setReplyId(_id)
                                            // setMessage(tags)

                                            setReply(_id, `@${ tags } `);
                                          }}
                                          deleteInternalComment={(subCommentId: string) => {
                                            deleteInternalComment(_id, subCommentId);
                                          }}
                                        />
                                    );
                                    }}
                                />
                                <TouchableOpacity 
                                    style={{ padding: 5}}
                                    onPress={()=>{
                                        setExposed(_id, false)
                                    }}>
                                    <Text style={{fontWeight: '500'}}>Hide replies</Text>
                                </TouchableOpacity>
                            </View>
                        :   <TouchableOpacity 
                                style={{ padding: 5}}
                                onPress={()=>{
                                    setExposed(_id, true)
                                }}>
                                <Text style={{fontWeight: '500'}}>View { subComments.length } more replies</Text>
                            </TouchableOpacity>
            }
            
            
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    // alignItems: 'center',
    // backgroundColor: 'red',
    backgroundColor: constants.colors.WHITE,
    padding: 5,
    // paddingVertical: 10,
    // margin: 5,
    borderColor:'gray',
    // borderWidth: .5
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
    // width: '90%',
    // backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: constants.fontSizes.username,
    fontWeight: '600',
    marginLeft: 10,
    // top: 5,
  },
  body: {
    fontSize: constants.fontSizes.comment,
    fontWeight: '400',
    // width: '80%',
    marginVertical: 10,
    // backgroundColor: 'blue',
    lineHeight: constants.fontSizes.comment + 6,
  },
  detailsContainer: {
    // width: '80%',
    // backgroundColor: 'green',
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