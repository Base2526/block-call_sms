import '../report/scss/index.scss'
import '../report/scss/CommentStructure.scss'
import '../report/scss/InputField.scss'
import '../report/scss/LoginSection.scss'

import React, { useEffect } from 'react'
import { CommentSection } from 'react-comments-section-ts'
import { useState } from 'react'
import { useQuery, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from 'react-redux';
import { DefaultRootState } from "@/interface/DefaultRootState"
import { getHeaders } from "@/utils";
import { query_comment, mutation_comment } from '@/apollo/gqlQuery';
import handlerError from "@/utils/handlerError";

interface CommentsProps { id: number; }

const Comments: React.FC<CommentsProps> = (props) => {
  const { profile } = useSelector((state: DefaultRootState) => state.user);
  const { id }      = props;
  
  console.log("Comments  :: >> ",  id);

  let date = new Date()
  const [data] = useState([
    /*
    {
      userId: '01a',
      comId: '012',
      fullName: 'Riya Negi',
      avatarUrl: 'https://ui-avatars.com/api/name=Riya&background=random',
      userProfile: 'https://www.linkedin.com/in/riya-negi-8879631a9/',
      text: `<p>Hey <strong>loved</strong> your blog! Can you show me some other ways to <del><em>fix</em></del>  solve this?🤔<br>Here's my <a href="https://www.linkedin.com/in/riya-negi-8879631a9/" target="_blank">Linkedin Profile</a> to reach out.</p>`,
      timestamp: `${new Date( date.getTime() - 5 * 60 * 60 * 1000 ).toISOString()}`,
      replies: [
        {
          userId: '02a',
          comId: '013',
          userProfile: 'https://www.linkedin.com/in/riya-negi-8879631a9/',
          fullName: 'Adam Scott',
          avatarUrl: 'https://ui-avatars.com/api/name=Adam&background=random',
          text: `<p>Yeah sure try adding this line to your code. You need to pass <span style="color: rgb(147,101,184);">event</span><span style="color: rgb(26,188,156);"> </span><span style="color: rgb(0,0,0);">as a param. </span></p>
          <pre>event.preventDefault()</pre>
          <p>Best of luck with your project! <br></p>
          <p></p>`,
          timestamp: `${new Date( date.getTime() - 30 * 60 * 1000 ).toISOString()}`
        },
        {
          userId: '01a',
          comId: '014',
          userProfile: 'https://www.linkedin.com/in/riya-negi-8879631a9/',
          fullName: 'Riya Negi',
          avatarUrl: 'https://ui-avatars.com/api/name=Riya&background=random',
          text: '<p><strong>OMG!</strong> it worked! <span style="color: rgb(209,72,65);">DO NOT stop this blog series!!!!</span> 💃</p>',
          timestamp: `${new Date()}`
        }
      ]
    },
    {
      userId: '02b',
      comId: '017',
      fullName: 'Lily',
      userProfile: 'https://www.linkedin.com/in/riya-negi-8879631a9/',
      text: `<blockquote><strong>DRY </strong>- is the right of passage to good coding</blockquote>
      <p>True story brother!! <em>Amen to that!  </em>For anyone wondering DRY is&nbsp;</p>
      <ol>
      <li>Don't</li>
      <li>Repeat</li>
      <li>Yoursef</li>
      </ol>`,
      avatarUrl: 'https://ui-avatars.com/api/name=Lily&background=random',
      timestamp: `${new Date( date.getTime() - 3 * 60 * 60 * 1000 ).toISOString()}`,
      replies: []
    }*/
  ])

  const [mutationComment] = useMutation(mutation_comment, {
    context: { headers: getHeaders(location) },
    update: (cache, { data: { comment } }) => {
      console.log("comment: ", comment);
    },
    onCompleted: (data, clientOptions) => {
      // setLoading(false);  
      // let { variables: { input } } : any = clientOptions;
      // if(input?.mode === 'added'){
      //   message.success('Added successfully!');
      //   navigate(-1);
      // }else if(input?.mode === 'edited'){
      //   message.success('Edited successfully!');
      //   navigate(-1);
      // }
    },
    onError: (error) => {
      console.log("error :", error);

      // setLoading(false);
      // handlerError(props, error);
    }
  });

  const { loading: loadingComment, 
          data: dataComment, 
          error: errorComment,
          refetch: refetchComment } = useQuery(query_comment, {
              context: { headers: getHeaders(location) },
              variables: { id },
              fetchPolicy: 'cache-first',
              nextFetchPolicy: 'network-only',
              notifyOnNetworkStatusChange: false,
              skip: !id,
          });

  if (errorComment) {
    handlerError(props, errorComment);
  }

  useEffect(() => {
    if (!loadingComment && dataComment?.comment) {
      console.log("useEffect DataComment() :", dataComment)
        // if (dataComment.comment.status) {
        //     console.log("DataComment :", dataComment)
        //     // setData(dataProduct.product.data);
        // }
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
              console.log('curent data item', v, newValue);
              mutationComment({ variables: { input: newValue } });
              break;
            }
            case "edit": {
               const newValue = { ...v,  postId: id };
               mutationComment({ variables: { input: newValue } });
              break;
            }
    
            case "delete": {
               const newValue = { ...v,  postId: id };
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
