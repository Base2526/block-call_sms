import React, { useState, useRef, useEffect } from "react";
import { TouchableOpacity, StyleSheet, View, Text, ActivityIndicator, Keyboard, TextInput, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { faker } from '@faker-js/faker';
import { RouteProp } from '@react-navigation/native';
import _ from "lodash"
import { useSelector } from 'react-redux';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useToast } from "react-native-toast-notifications";

import KeyboardStickyView from "./KeyboardStickyView"
import MainComment from './MainComment';
import constants from "./constants";
import { StatusInterface, CommentInterface, SubCommentInterface, UserCommentInterface, ReplyInterface } from "./interfaces"
import { RootState } from '../redux/store';
import generateComments from "./FakerComment"
import handlerError from "../handlerError";

import { getHeaders, generateObjectId } from "../utils";
import { query_comment, mutation_comment } from "../gqlQuery";
import { Input } from "@flyerhq/react-native-chat-ui";

type CommentsProps = {
  navigation: any;
  route: RouteProp<{ params: { _id: string } }>;
};

const CommentsScreen: React.FC<CommentsProps> = (props) => {
  const { navigation, route } = props
  const { _id } = route.params;

  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<CommentInterface[]>([]);//useState(generateComments(10));
  const [reply, setReply] = useState<ReplyInterface | null>(null)
  const textInputRef = useRef(null);
  const toast = useToast();
  const current_user = useSelector((state: RootState) => state.user.user );

  console.log("CommentsScreen :", _id)

  const [onComment] = useMutation(mutation_comment, {
    context: { headers: getHeaders() },
    // Optimistic UI updates could be re-enabled with minimal state for quick feedback
    update: (cache, { data: { comment_by_id } }, params) => {
      let { status, data } = comment_by_id;
      let { input } = params?.variables;
  
      if (status) {
        const existingComment = cache.readQuery({
          query: query_comment,
          variables: { input: { id: input.reportId } }, // Ensure variables are correct
        });
  
        // Create a deep clone of the comment input and set status to 'SENT'
        let comment = { ...input.comment, status: 'SENT' };
  
        if (existingComment) {
          // Handle adding new comments
          if (input.commentId === undefined) {
            // Create a deep copy of the existing data to prevent direct mutations
            const updatedData = _.cloneDeep(existingComment?.comment_by_id.data);
  
            cache.writeQuery({
              query: query_comment,
              variables: { input: { id: input.reportId } },
              data: {
                comment_by_id: {
                  ...existingComment.comment_by_id,
                  data: [...updatedData, comment], // Add the new comment to the end
                },
              },
            });
          } else {
            // Handle updating sub-comments in an existing comment
            const updatedData = _.map(existingComment?.comment_by_id.data, (v) => {
              if (v._id === input.commentId) {
                return {
                  ...v,
                  exposed: true, // Optimistically expose comment
                  subComments: [...v.subComments, comment], // Add the new subComment
                };
              }
              return v;
            });
  
            // Write updated data back to the cache
            cache.writeQuery({
              query: query_comment,
              variables: { input: { id: input.reportId } },
              data: {
                comment_by_id: {
                  ...existingComment.comment_by_id,
                  data: updatedData, // Replace with the updated data array
                },
              },
            });
          }
        }
      }
    },
    // Memoize error handler to prevent unnecessary recalculations
    onError: React.useCallback((error: ApolloError) => {
      handlerError(props, toast, error);
    }, [props, toast]),
    // Completion handler (if needed)
    onCompleted: (data, clientOptions) => {
      // Use clientOptions if needed for further optimizations
    },
  });
  
  const { loading: loadingComment, 
        data: dataComment, 
        error: errorComment,
        refetch: refetchComment} = useQuery(query_comment, {
          context: { headers: getHeaders() },
          fetchPolicy: 'cache-first', 
          nextFetchPolicy: 'network-only', 
          notifyOnNetworkStatusChange: false,
          skip: _.isEmpty( _id ), // This will skip the query if the condition is true
        });

  if(errorComment){
    handlerError(props, toast, errorComment)
  }

  useEffect(() => {
    console.log("comments :", comments)
  }, [comments]);

  useEffect(() => {
    if (!_.isEmpty(_id)) {
      refetchComment({ input:{ id: _id }  });
    }
  }, [_id]);

  useEffect(() => {
    if (!loadingComment && dataComment?.comment_by_id) {

      if(dataComment.comment_by_id.status){
        console.log("useEffect :", dataComment.comment_by_id)
        setComments(dataComment.comment_by_id.data)
      }
    }
  }, [dataComment, loadingComment]);

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
    if(_.isEmpty(message))return;

    const currentUserComment: UserCommentInterface = {
      userId: current_user?._id ? current_user?._id : "",
      username: current_user?.current.username ? current_user?.current.username : "",
      url: faker.image.avatar()
    }

    if( !_.isEmpty(reply?._id) ){
      const newSubComment: SubCommentInterface = {
        _id: generateObjectId(),
        text: message,
        user: currentUserComment,
        status: StatusInterface.SENT,
        created: Date.now(),
        updated: Date.now(),
      };
  
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === reply?._id
            ? {
                ...comment,
                // exposed: true,
                subComments: [...comment.subComments, newSubComment],
              }
            : comment
        )
      );


      setReply(null)
      setMessage("")

      onComment({ variables:{ input:{ reportId: _id, commentId: reply?._id, comment: newSubComment } } })
    }else{
      const newCommentObject: CommentInterface = {
        _id: generateObjectId(),
        text: message,
        user: currentUserComment, 
        // exposed: false,
        status: StatusInterface.SENDING,
        created: Date.now(),
        updated: Date.now(),
        subComments: [],
      };
  
      setComments((prevComments) => [...prevComments, newCommentObject]);

      setMessage("")

      onComment({ variables:{ input:{ reportId: _id, comment: newCommentObject  } } })
    }
  };

  return (
    <View>
      <View style={styles.container}>
        {
          _.isEmpty(comments)
          ? loadingComment 
            ? <View style={[styles.containerSafe, { paddingBottom: _.isEmpty(current_user)? 0 : 50, justifyContent: 'center',  }]}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            : <View style={[styles.containerSafe, { paddingBottom: _.isEmpty(current_user)? 0 : 50, justifyContent: 'center',  }]}>
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsText2}>Start the conversation.</Text>
              </View>
          : <View style={[styles.containerSafe, { paddingBottom: _.isEmpty(current_user)? 0 : 50 }]}>
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
                      reply={reply}
                      setExposed={(_id: string, exposed: boolean)=>{
                        setExposedById(_id, exposed)
                      }}
                      setReply={(_id: string, tag: string, selectId: string)=>{
                        setReply(null)
                        setReply({_id, tag, selectId})

                        setMessage(tag)

                        textInputRef.current?.focus();
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
        }
      </View>
      {
        !_.isEmpty(current_user)
        ? <KeyboardStickyView style={{borderWidth: .5, borderColor: 'gray'}}>
            {
              !_.isEmpty(reply?._id) 
              ? <View style={{height: 40, 
                  width:'100%', 
                  backgroundColor: '#eee', 
                  // justifyContent:'center',
                  alignItems:'center', 
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                  }}>
                  <View style={{flexDirection:'row', marginLeft: 10}}>
                    <Text style={{fontSize: 16}}>Replying to { reply?.tag }</Text>
                  </View>
                  <TouchableOpacity 
                    style={{flexDirection:'row'}}
                    onPress={()=>{ 
                      setReply(null)
                      setMessage("")

                      Keyboard.dismiss()
                    }}>
                    <Icon name="close" size={15} color={ "#333" } style={{ padding: 10}}/>
                  </TouchableOpacity>
                </View>
              : <></>
            }
            <View style={{flexDirection:'row'}}>
              <TextInput
                ref={textInputRef}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={() => {console.log(">")}}
                placeholder="Add a comment..."
                multiline
                style={styles.textInput}
              />
              <TouchableOpacity style={styles.sendButton} onPress={()=>{ sendComment() }}>
                <Icon name="send" size={24} color={ _.isEmpty(message) ? "#333" : '#007BFF' }/>
              </TouchableOpacity>
            </View>
          </KeyboardStickyView>
        : <></>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    backgroundColor: constants.colors.WHITE,
  },
  containerSafe: {
    width: '100%',
    height: '100%',
    // paddingBottom: 45,
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
    minHeight: 40, // Minimum height
    maxHeight: 120, // Maximum height
  },
  sendButton: {
    justifyContent: 'center', // Center the icon horizontally
    alignItems: 'center', // Center the icon vertically
    padding: 10, // Padding around the icon
    backgroundColor: 'gray'
  },
  noCommentsText: {
    fontSize: 28,
    color: 'gray', // Example color, customize as needed
    textAlign: 'center',
  },
  noCommentsText2: {
    fontSize: 18,
    color: '#ccc', // Example color, customize as needed
    textAlign: 'center',
  },
});

export default CommentsScreen;