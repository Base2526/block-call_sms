import {useDispatch, useSelector} from 'react-redux';
import {createSelector} from 'reselect';
// import {setComments} from '../redux/comments/actions';

const useComments = () => {
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);

  const setCommentData = (value: any) => {
    // dispatch(setComments(value));
  };

  return {
    comments,
    setCommentData,
  };
};

const selectComments = createSelector(
  (state: any) => (state as any).comments,
  (comments: any) => comments,
);
export default useComments;