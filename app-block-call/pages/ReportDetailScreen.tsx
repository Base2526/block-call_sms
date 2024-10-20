import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, Dimensions  } from 'react-native';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useToast } from "react-native-toast-notifications";
import { RouteProp } from '@react-navigation/native';
import _ from "lodash";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { Menu, Divider } from 'react-native-paper';
import Share from 'react-native-share';
import { useSelector } from 'react-redux';

import { query_report, mutation_like_report } from "../gqlQuery";
import { getHeaders } from "../utils";
import handlerError from "../handlerError";
import { RootState, AppDispatch } from '../redux/store';

import ImageZoomViewer from "./ImageZoomViewer";
import CommentActionSheet from "./CommentActionSheet";
import { useMyContext } from '../MyProvider'; 

type ReportDetailProps = {
  navigation: any;
  route: RouteProp<{ params: { _id: string } }>;
};

const ReportDetailScreen: React.FC<ReportDetailProps> = (props) => {
  let { navigation, route } = props
  const { _id } = route.params;
  
  const [visibleMenu, setVisibleMenu] = useState(false);
  const toast = useToast();
  const [data, setData] = useState();
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ url: string }[]>([]);

  const actionSheetRef = useRef<ActionSheet>(null);
  const user = useSelector((state: RootState) => state.user.user );
  const [likeReportId, setLikeReportId] = useState("")
  const [likedIndex, setLikedIndex] = useState(-1)

  const { openLoginModal } = useMyContext();

  const [onLikeRepost] = useMutation(mutation_like_report, {
    context: { headers: getHeaders() },
    update: (cache, { data: { like_report } }) => {
        let { status, data, likedIndex } = like_report;

        // console.log("onLikeRepost :", like_report);
        if (status) {
            const existingReport = cache.readQuery({
                query: query_report,
                variables: { id: data.reportId },
            });

            if (existingReport) {
                // Use filter to create a new likes array
                let newLikes;

                if(existingReport.report.data.likes === undefined){
                  newLikes = [ { _id: (Math.random() + 1).toString(36).substring(7), userId: data.userId } ];
                }else{
                  if (likedIndex === -1) {
                    // User liked the report (not previously liked)
                    newLikes = [
                        ...existingReport.report.data.likes,
                        { _id: (Math.random() + 1).toString(36).substring(7), userId: data.userId }, // Add the new like
                    ];
                  } else {
                      // User unliked the report (previously liked)
                      newLikes = existingReport.report.data.likes.filter(like => like.userId !== data.userId);
                  }
                }

                // Write the updated report back to the cache
                cache.writeQuery({
                    query: query_report,
                    variables: { id: data.reportId },
                    data: {
                        report: {
                            ...existingReport.report,
                            data: {
                                ...existingReport.report.data,
                                likes: newLikes,
                            },
                        },
                    },
                });
            }
        }
    },
    onCompleted(data) {
        // Handle onCompleted actions if necessary
    },
    onError(error: ApolloError) {
        handlerError(props, toast, error);
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
          {/* <TouchableOpacity style={{padding:5}}  onPress={() => { toast.show("handle like"); }}>
            <Icon name="heart-outline" size={30} color="#555" />
          </TouchableOpacity> */}
          { !_.isEmpty(data) && renderHeartItem() }
          {/* <TouchableOpacity style={{padding:5}}  onPress={() => { toast.show("handle bookmark"); }}>
            <Icon name="bookmark-outline" size={30} color="#555" />
          </TouchableOpacity> */}
          <TouchableOpacity style={{padding:5}}  onPress={() => {  navigation.navigate("Comments",  { _id:  data._id})  }}>
            <Icon name="comment-outline" size={30} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={{padding:5}}  onPress={handleShare} >
            <Icon name="share" size={30} color="#555" />
          </TouchableOpacity>
          <View >
            <Menu
              visible={visibleMenu}
              onDismiss={()=> setVisibleMenu(false)}
              anchor={
                <TouchableOpacity onPress={()=> setVisibleMenu(true)}>
                  <Icon name="dots-vertical" size={30} color="#555" />
                </TouchableOpacity>
              }>
              <Menu.Item onPress={() => setVisibleMenu(false) } title="Unblock" />
            </Menu>
          </View>
        </View>
      ),
      headerShown: true, // hide/show header parent
    });
  }, [navigation, route, visibleMenu, data]);

  const { loading: loadingReport, 
        data: dataReport, 
        error: errorReport,
        refetch: refetchReport} = useQuery(query_report, {
            context: { headers: getHeaders() },
            fetchPolicy: 'cache-first', 
            nextFetchPolicy: 'network-only', 
            notifyOnNetworkStatusChange: false,
            skip: !_id
        });

  if (errorReport) {
    handlerError(props, toast, errorReport);
  }

  useEffect(() => {
    if (!_.isEmpty(_id)) {
      refetchReport({ id: _id });
    }
  }, [_id]);

  useEffect(() => {
    if (!loadingReport && dataReport?.report) {
      if (dataReport.report.status) {

        // console.log("ReportDetailScreen :", dataReport.report.data)
        setData(dataReport.report.data);
      }
    }
  }, [dataReport, loadingReport]);

  const handleActionPress = (action: string) => {
    // console.log(`Selected Action: ${action}`);
    actionSheetRef.current?.hide(); // Hide the action sheet
  };

  const handleShare = async () => {
    try {
      // Add the Share functionality
      const shareOptions = {
        title: 'Share via',
        message: 'Check out this report!',
        url: `http://your-backend-url.com/report/${_id}`, // Replace with the actual URL
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const renderHeartItem = () =>{
    let isLiked = data?.likes?.some(like => like.userId === user?._id)

    // console.log("isLiked :", isLiked, data?.likes, user?._id)

    function click(item :any){
      if(_.isEmpty(user)){
        openLoginModal()
      }else{
        // let likedIndex = item?.likes?.some(like => like.userId === user?._id) ? 1 : -1
        // setLikeReportId(item._id)
        // setLikedIndex(likedIndex)

        onLikeRepost({ variables:{ input:{ _id: data._id } } })
      }
    } 

    return  <TouchableOpacity 
              style={{ padding: 5, flexDirection: 'row', alignItems: 'baseline' }} 
              onPress={() => { click(data) }}>
              <Icon 
                name={isLiked ? "heart" : "heart-outline"} 
                size={30} 
                color={isLiked ? 'red' : '#555'} 
              />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ }}>
                  {data?.likes?.length > 0 ? data?.likes?.length : ""}
                </Text>
              </View>
            </TouchableOpacity>
  }

  return (
    <View style={styles.container}>
      {loadingReport && _.isEmpty(data) ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => {
              // Show ImageViewer when image is pressed
              if(data?.current?.images) {
                setImageUrls(data?.current?.images.map((img: any) => ({ url: `http://192.168.1.3:1984/${img.url}` })));
                setImageViewerVisible(true);
              }
            }}>
            {data?.current?.images
              ? <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: `http://192.168.1.3:1984/${data?.current?.images[0].url}` }} 
                    style={styles.image} 
                  />
                  <View style={styles.imageCountContainer}>
                    <Text style={styles.imageCountText}>
                      {data?.current?.images.length}
                    </Text>
                  </View>
                </View>
              : <Icon name="account" size={30} />}
          </TouchableOpacity>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>ชื่อ-นามสกุล {data?.current?.sellerFirstName} {data?.current?.sellerLastName}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{fontWeight:'700', fontSize: 16}}>รายละเอียด </Text>
              <Text style={styles.description}>{data?.current?.additionalInfo}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{fontWeight:'700', fontSize: 16}}>ID Card </Text>
              <Text style={styles.phone}>{data?.current?.idCard}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{fontWeight:'700', fontSize: 16}}>เว็บไซต์</Text>
              <Text style={styles.phone}> {data?.current?.sellingWebsite}</Text>
            </View>
            <Text style={{fontWeight:'700', fontSize: 16}}>เบอร์โทร/line id</Text>
            {
              _.map(data?.current?.telNumbers, (value, index)=>{
                return <TouchableOpacity key={index}><Text style={styles.phone}>- {value.tel}</Text></TouchableOpacity>
              })
            }
            <Text style={{fontWeight:'700', fontSize: 16}}>บัญชีธนาคาร </Text>
            {
               _.map(data?.current?.sellerAccounts, (value, index)=>{
                return <TouchableOpacity key={index}><Text style={styles.phone}>- {value.sellerAccount}/{value.bankName_th}</Text></TouchableOpacity>
              })
            }
          </View>
          { isImageViewerVisible &&  <ImageZoomViewer images={imageUrls} isVisible={isImageViewerVisible} onClose={()=>setImageViewerVisible(false)}/> }
          <CommentActionSheet actionSheetRef={actionSheetRef} />
        </ScrollView>
      )}
    </View>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingLeft: 5,
    paddingRight: 5,
    // backgroundColor: 'red',
  },
  avatarContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 16,
    // backgroundColor:'blue'
  },
  detailsContainer: {
    // paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    // backgroundColor:'blue'
  },
  description: {
    fontSize: 16,
    color: '#666',
    // backgroundColor:'blue'
  },
  phone: {
    color: '#555',
  },
  imageCountContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 5,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    // backgroundColor: 'green'
  },
  openButton: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionSheetContainer: {
    height: '90%',//SCREEN_HEIGHT * 0.8,  // Max height for the sheet
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 10,
  },
  actionSheetContent: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  actionSheetText: {
    fontSize: 18,
    marginBottom: 20,
  },
  dragIndicatorTouchable: {
    padding: 10,
    backgroundColor: '#efefef',
    borderRadius: 50,
    alignItems: 'center',
  },
});

export default ReportDetailScreen;