import '../report/scss/index.scss'
// import '../report/scss/CommentStructure.scss'
import '../report/scss/InputField.scss'
import '../report/scss/LoginSection.scss'

import 'react-comments-section-ts/dist/index.css'

import React, { useEffect } from 'react'
import { CommentSection, CommentStatus } from 'react-comments-section-ts'
import { useState } from 'react'
import { useQuery, useMutation, ApolloCache } from "@apollo/client";
import { useDispatch, useSelector } from 'react-redux';
import { DefaultRootState } from "@/interface/DefaultRootState"
import { getHeaders } from "@/utils";
import { query_comment, mutation_comment } from '@/apollo/gqlQuery';
import handlerError from "@/utils/handlerError";

interface CommentsProps { id: number; }

const Comments: React.FC<CommentsProps> = (props) => {
  const { profile } = useSelector((state: DefaultRootState) => state.user);
  const { id }      = props;
  
  console.log("Comments  :: >> ",  id, profile);

  const variable = { id };

  let date = new Date()
  const [data, setData] = useState([])

  const [mutationComment] = useMutation(mutation_comment, {
    context: { headers: getHeaders(location) },
    update: (cache, { data: { comment } }, { variables }) => {
      const existing = cache.readQuery<any>({
        query: query_comment,
        variables: variable,
      });
      console.log("mutationComment [update]: ", id, comment, variables, existing);
      if (!existing) return;

      let updatedData = [...existing.comment.data]; // clone original comments
      const newData = variables?.input?.data;
      const mode = variables?.input?.mode || variables?.mode;

      console.log("[updatedData] @1 :", updatedData);
      
      switch(mode){
        case "new":{
          if (!newData?.parentId) {
            // Add new root comment
            updatedData.unshift(newData);
          } else {
            // Add reply to a comment
            updatedData = updatedData.map(comment => {
              if (comment.comId === newData.parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newData],
                };
              }
              return comment;
            });
          }
          break;
        }

        case "edit":{
          updatedData = updatedData.map(comment => {
            if (comment.comId === variables?.input?.comId) {
              return {
                ...comment,
                text: variables?.input?.text,
              };
            }
            return {
              ...comment,
              replies: comment.replies?.map((reply :any) =>
                reply.comId === variables?.input?.comId ? { ...reply, text: variables?.input?.text } : reply
              ),
            };
          });
          break;
        }

        case "delete":{
          updatedData = updatedData
          .map(comment => {
            if (comment.comId === variables?.input.comId) {
              return null; // mark for removal
            }
            return {
              ...comment,
              replies: comment.replies?.filter((reply :any) => reply.comId !== variables?.input.comId),
            };
          })
          .filter(Boolean); // remove null entries
          break;
        }
      }

      let newComment = {
                          comment: {
                            ...existing.comment,
                            data: updatedData,
                          },
                        }
      console.log("[updatedData] @2 :", existing, newComment);
      // Write the updated cache
      cache.writeQuery({
        query: query_comment,
        variables: variable,
        data: newComment,
      });
    },
    onCompleted: (data, clientOptions) => {
    },
    onError: (error) => {
      console.log("error :", error);
    }
  });

  const { loading: loadingComment, 
          data: dataComment, 
          error: errorComment} = useQuery(query_comment, {
              context: { headers: getHeaders(location) },
              variables: variable,
              fetchPolicy: 'cache-first',
              nextFetchPolicy: 'network-only',
              notifyOnNetworkStatusChange: false,
              skip: !id,
          });

  if (errorComment) {
    // handlerError(props, errorComment);
  }

  useEffect(() => {
    console.log("useEffect @1 :", dataComment)
    if (!loadingComment && dataComment?.comment) {
      console.log("useEffect @2 :", dataComment)
      if (dataComment.comment.status) setData(dataComment.comment.data);
    }
  }, [dataComment, loadingComment]);

  return (
    <div style={{ width: '100%' }}>
      <CommentSection
        currentUser={{
          currentUserId: profile.id ?? "" ,
          currentUserImg: 'https://ui-avatars.com/api/name=Riya&background=random',
          currentUserProfile: '',
          currentUserFullName: profile.display_name ?? ""
        }}
        // currentUser={null}
        hrStyle={{ border: '0.5px solid #ff0072' }}
        commentData={data}
        currentData={(data: any) => {
          console.log('curent data', data)
        }}
        currentDataItem={(v: any) => {
          switch(v.mode){
            case "new": {
              const newValue = { ...v, data: { ...v.data, postId: id } };
              console.log('comment : ', v, newValue);
              mutationComment({ variables: { input: newValue } });
              break;
            }
            case "edit": {
               const newValue = { ...v,  postId: id };
               console.log('comment : ', v, newValue);
               mutationComment({ variables: { input: newValue } });
              break;
            }
    
            case "delete": {
               const newValue = { ...v,  postId: id };
               console.log('comment : ', v, newValue);
               mutationComment({ variables: { input: newValue } });
              break;
            }
          }
        }}
        logIn={{
            // loginLink: 'http://localhost:3001/',
            onLogin: () => alert('Call login function '),
            // signUpLink: 'http://localhost:3001/',
            // onLogin:()=>{console.log("onLogin")},
            onSignUp:()=>{console.log("onLogin")}
            // onLogin: ()=>{console.log("onLogin")},
        }}
        customImg='https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=60'
        inputStyle={{ border: '1px solid rgb(208 208 208)' }}
        formStyle={{ backgroundColor: 'white' }}
        submitBtnStyle={{
          border: '1px solid black',
          backgroundColor: 'black',
          padding: '7px 15px'
        }}
        cancelBtnStyle={{
          border: '1px solid gray',
          backgroundColor: 'gray',
          color: 'white',
          padding: '7px 15px'
        }}
        advancedInput={true}
        replyInputStyle={{ borderBottom: '1px solid black', color: 'black' }}
      /> 
    </div>
  )
}

export default Comments
