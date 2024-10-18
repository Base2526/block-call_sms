import {useDispatch, useSelector} from 'react-redux';
import {createSelector} from 'reselect';
// import {setReply} from '../redux/reply/actions';

const useReply = () => {
  const dispatch = useDispatch();
  const reply = useSelector(selectReply);

  const setReplyData = (value: any) => {
    // dispatch(setReply(value));
  };

  return {
    reply,
    setReplyData,
  };
};

const selectReply = createSelector(
  (state: any) => (state as any).reply,
  (reply: any) => reply,
);
export default useReply;