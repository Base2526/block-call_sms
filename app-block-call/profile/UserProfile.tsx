import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { TabView, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { Menu, Divider } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useToast } from "react-native-toast-notifications";
import _ from "lodash"
import { useSelector, useDispatch } from 'react-redux';

import { query_user, mutation_follow } from "../gqlQuery";
import Posts from './Posts';
import handlerError from "../handlerError";
import { getHeaders, generateObjectId } from "../utils";
import { RootState, AppDispatch } from '../redux/store';
import { useMyContext } from '../MyProvider'; 
import { updateUser } from "../redux/slices/userSlice"

type ProfileProps = {
  navigation: any;
  route: RouteProp<{ params: { _id: string } }>;
};

const UserProfile: React.FC<ProfileProps> = (props) => {
  const { navigation, route } = props
  const { _id } = route?.params;

  // console.log("UserProfile :", _id)

  const [tabs, setTabs] = useState({
    index: 0,
    routes: [
      { key: '1', title: 'Reports', count: 31 },
      { key: '2', title: 'Like', count: 86 },
      { key: '3', title: 'Following', count: 95 },
      { key: '4', title: 'Followers', count: 0 },
    ],
  });

  // const navigation = useNavigation();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const toast = useToast();
  const [data, setData] = useState();
  const current_user = useSelector((state: RootState) => state.user.user );
  const { openLoginModal } = useMyContext();

  const dispatch: AppDispatch = useDispatch();

  const followView = (current_user: any) => {
    if (!current_user?.follows) {
      return <Text style={{ fontWeight: '600' }}>Follow</Text>;
    }
    const isFollow = current_user.follows.some((v) => v.userId === _id);
    return (
      <Text style={{ fontWeight: '600', color: isFollow ? 'green' : 'black' }}>
        {isFollow ? 'Following' : 'Follow'}
      </Text>
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
          <TouchableOpacity 
            style={{
                  paddingTop:5, 
                  paddingBottom:5, 
                  paddingRight:10,
                  paddingLeft:10, 
                  borderColor: 'gray', 
                  borderWidth: 1,
                  borderRadius: 5,
                  marginRight: 10,
                  flexDirection: 'row'
            }} 
            onPress={()=>{
              console.log("data :", data)
              if(_.isEmpty(current_user)){
                openLoginModal()
              }else{
                setLoadingFollow(true)
                onFollow({ variables:{ input:{ _id: data._id } } })
              } 
            }}>
            { followView(current_user) }
            { loadingFollow && <ActivityIndicator size="small" color="#0000ff" /> }
          </TouchableOpacity>
          <Menu
            visible={visibleMenu}
            onDismiss={()=> setVisibleMenu(false)}
            anchor={
              <TouchableOpacity onPress={()=> setVisibleMenu(true)}>
                <Icon name="dots-vertical" size={30} color="#555" />
              </TouchableOpacity>
            }>
            <Menu.Item onPress={() => setVisibleMenu(false) } title="Share profile" />
          </Menu>
        </View>
      ),
    });
  }, [navigation, visibleMenu, data, loadingFollow, current_user]);

  const [onFollow] = useMutation(mutation_follow, {
    context: { headers: getHeaders() },
    update: (cache, { data: { follow } }, params) => {
      const { status, followIndex } = follow;
      const { variables } = params;
  
      if (!status || !variables?.input?._id) {
        setLoadingFollow(false);
        return;
      }
  
      const userId = variables.input._id;
      let updatedFollows = current_user.follows ? current_user.follows.filter(f => f.userId !== userId) : [];
  
      if (followIndex === 1) {
        updatedFollows = [...updatedFollows, { _id: generateObjectId(), userId }];
      }
  
      const newUser = { ...current_user, follows: updatedFollows };
      dispatch(updateUser(newUser));
  
      setLoadingFollow(false);
    },
    onCompleted(data) {
      // Handle onCompleted actions if necessary
      setLoadingFollow(false)
    },
    onError(error: ApolloError) {
      setLoadingFollow(false)
      handlerError(props, toast, error);
    },
  });
  
  const { loading: loadingUser, 
        data: dataUser, 
        error: errorUser,
        refetch: refetchUser} = useQuery(query_user, {
            context: { headers: getHeaders() },
            fetchPolicy: 'cache-first', 
            nextFetchPolicy: 'network-only', 
            notifyOnNetworkStatusChange: false,
            skip: !_id
        });

  if (errorUser) {
    handlerError(props, toast, errorUser);
  }

  // useEffect(()=>{
  //   console.log("Current user :", current_user)
  // }, [current_user])

  useEffect(() => {
    if (!_.isEmpty(_id)) {
      refetchUser({ input:{ _id } });
    }
  }, [_id]);

  useEffect(() => {
    if (!loadingUser && dataUser?.user) {
      if (dataUser.user.status && dataUser.user.data !== null ) {
        setData(dataUser.user.data);

        let { followers, follows }  = dataUser.user.data
        if(followers !== undefined){
          setTabs((prevTabs) => ({
            ...prevTabs,
            routes: prevTabs.routes.map(route => {
              if (route.key === '3') {
                return { ...route, count: follows?.length };
              }
              if (route.key === '4') {
                return { ...route, count: followers?.length };
              }
              return route; // Return unchanged route
            }),
          }));
        }
        
      }
    }
  }, [dataUser, loadingUser]);

  

  const handleIndexChange = (index: number) => {
    setTabs({ ...tabs, index });
  };

  const renderLabel = (props: any) => ({ route }: any) => {
    const routes = props.navigationState.routes;
    const labels: string[] = routes.map((e, index) => index === props.navigationState.index ? 'black' : 'gray');
    const currentIndex = parseInt(route.key) - 1;
    const color = labels[currentIndex];

    return (
      <View>
        <Animated.Text style={[styles.tabLabelText, { color }]}>{route.count}</Animated.Text>
        <Animated.Text style={[styles.tabLabelNumber, { color }]}>{route.title}</Animated.Text>
      </View>
    );
  };

  const renderTabBar = (props: any) => (
    <TabBar
      indicatorStyle={styles.indicatorTab}
      renderLabel={renderLabel(props)}
      pressOpacity={0.8}
      style={styles.tabBar}
      {...props}
    />
  );

  const renderScene = ({ route: { key } }: any) => {
    let posts = [
      {
        "id": 1,
        "words": "cupiditate qui cum",
        "sentence": "Ipsum laborum quasi debitis dolores veniam.",
        "sentences":
          "Impedit veritatis harum nihil dolores dolorem optio assumenda. Laborum saepe voluptas officia odit. Ut voluptas mollitia mollitia eum autem quisquam qui aut. Et ipsa hic harum molestias et quam qui cum. Sint sit soluta.",
        "paragraph":
          "Beatae voluptas ea magni quibusdam dolorem sit aut qui. Dolorem rerum et consequuntur inventore officia excepturi dolore architecto fuga. Quia consequatur asperiores rerum qui corporis dolorum. At harum velit adipisci iste odit modi veniam ut. Deserunt quibusdam velit non ea.",
        "image":
          "https://d25tv1xepz39hi.cloudfront.net/2016-12-19/files/foodphotoghacks_image8.jpg",
        "createdDate": "2017-11-21T02:33:53.770Z",
        "user": {
          "name": "Ronaldo",
          "username": "Ronaldo.Effertz",
          "avatar":
            "https://s3.amazonaws.com/uifaces/faces/twitter/samuelkraft/128.jpg",
          "email": "Ronaldo.Effertz.Deckow@hotmail.com"
        }
      },
      {
        "id": 2,
        "words": "est voluptatum aut",
        "sentence": "Omnis omnis aut dolor quaerat sunt et optio.",
        "sentences":
          "Nam numquam magni saepe. Deserunt aspernatur dolorem libero soluta sint molestias et sint sed. Maiores id quis assumenda voluptates quos ut saepe officia voluptatem. Ea placeat sed ut. Modi sed earum voluptas cumque unde eum doloribus ipsam.",
        "paragraph":
          "Quam aut reprehenderit asperiores aut. Sunt quis aspernatur incidunt. Illo et perferendis ex incidunt eos ut maxime dolorem voluptatem. Qui rem nihil quos cumque eum doloribus. Quae beatae tempore commodi.",
        "createdDate": "2017-11-20T18:04:58.858Z",
        "user": {
          "name": "Markus",
          "username": "Markus.Price68",
          "avatar":
            "https://s3.amazonaws.com/uifaces/faces/twitter/kikillo/128.jpg",
          "email": "Markus.Price68.Dicki@yahoo.com"
        }
      },
      {
        "id": 3,
        "words": "vitae voluptas quia",
        "sentence": "Voluptates dolor ad rem amet voluptas.",
        "sentences":
          "Rem ipsum quis. Animi ipsum ut at possimus. Beatae molestiae non odio soluta quidem ut suscipit.",
        "paragraph":
          "Veniam veritatis nihil illum rerum et. Temporibus facere sed delectus corporis alias. Et odio aliquid est. Quas sit et quia tempora sit eveniet quam.",
        "createdDate": "2017-03-24T10:56:15.461Z",
        "image": "https://touristmeetstraveler.com/wp-content/uploads/sushi.jpg",
        "user": {
          "name": "Magali",
          "username": "Magali16",
          "avatar":
            "https://s3.amazonaws.com/uifaces/faces/twitter/mastermindesign/128.jpg",
          "email": "Magali1664@gmail.com"
        }
      }
    ]

    switch (key) {
      case '1':
      case '2':
      case '3':
      case '4':
        return <Posts containerStyle={styles.sceneContainer} posts={posts} />;
      default:
        return <View />;
    }
  };

  const renderContactHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.userRow}>
        <TouchableOpacity>
          <Image style={styles.userImage} source={{ uri: "https://i.imgur.com/GfkNpVG.jpg" }} />
        </TouchableOpacity>
        <View style={styles.userNameRow}>
          <Text style={styles.userNameText}>{data? data.current.displayName: ""}</Text>
        </View>
        <View style={styles.userBioRow}>
          <Text style={styles.userBioText}>{data? data.current.email : ""}</Text>
        </View>
      </View>
      <View style={[styles.socialRow, { }]}>
        <TouchableOpacity 
          style={{padding: 10}}
          onPress={()=>{}}>
          <Icon size={30} color="#3B5A98" name="facebook" onPress={() => console.log('facebook')} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{padding: 10}}
          onPress={()=>{}}>
          <Icon size={30} color="#56ACEE" name="twitter" onPress={() => console.log('twitter')} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{padding: 10}}
          onPress={()=>{}}>
          <Icon size={30} color="#DD4C39" name="google" onPress={() => console.log('google')} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
      <View style={[styles.container]}>
        <View style={styles.cardContainer}>
          {renderContactHeader()}
          <TabView
            style={[styles.tabContainer]}
            navigationState={tabs}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={handleIndexChange}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 10,
    marginTop: 45,
  },
  indicatorTab: {
    backgroundColor: 'transparent',
  },
  scroll: {
    backgroundColor: '#FFF',
  },
  sceneContainer: {
    marginTop: 10,
  },
  socialIcon: {
    marginLeft: 14,
    marginRight: 14,
  },
  socialRow: {
    flexDirection: 'row',
  },
  tabBar: {
    backgroundColor: '#EEE',
  },
  tabContainer: {
    flex: 1,
    marginBottom: 12,
  },
  tabLabelNumber: {
    color: 'gray',
    fontSize: 12.5,
    textAlign: 'center',
  },
  tabLabelText: {
    color: 'black',
    fontSize: 22.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  userBioRow: {
    marginLeft: 40,
    marginRight: 40,
  },
  userBioText: {
    color: 'gray',
    fontSize: 13.5,
    textAlign: 'center',
  },
  userImage: {
    borderRadius: 5,
    height: 120,
    marginBottom: 10,
    width: 120,
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: '#5B5A5A',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 12,
  },
})

export default UserProfile;
