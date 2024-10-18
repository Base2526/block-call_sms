import {useDispatch, useSelector} from 'react-redux';
import {createSelector} from 'reselect';
// import {setUsername} from '../redux/username/actions';

const useUsername = () => {
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

  const setUsernameData = (value: any) => {
    // dispatch(setUsername(value));
  };

  return {
    username,
    setUsernameData,
  };
};

const selectUsername = createSelector(
  (state: any) => (state as any).username,
  (username: any) => username,
);
export default useUsername;