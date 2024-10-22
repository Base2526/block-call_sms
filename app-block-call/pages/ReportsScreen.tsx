import React, { useCallback, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, 
        TouchableOpacity, Alert, Image, 
        RefreshControl, FlatList, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Divider } from 'react-native-paper';
import { useToast } from "react-native-toast-notifications";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import _ from "lodash";
import Share from 'react-native-share';
import ActionSheet from 'react-native-actions-sheet';
import { RootState, AppDispatch } from '../redux/store';
import { BlockItem } from "../redux/interface"
import { addBlocks, removeBlock } from "../redux/slices/blockSlice";
import { query_reports, mutation_like_report } from "../gqlQuery";
import { getHeaders, generateObjectId, countTotalComments } from "../utils";
import handlerError from "../handlerError";
import ImageZoomViewer from "./ImageZoomViewer";
import CommentActionSheet from "./CommentActionSheet";
import TabIconWithMenu from "../TabIconWithMenu";
import { useAppContext } from '../context/DataContext';

import { useMyContext } from '../MyProvider'; 

type ReportsScreenProps = {
  navigation: any;
  route: any;
  setMenuOpen: () => void; 
};

const ReportsScreen: React.FC<ReportsScreenProps> = (props) => {
  let { navigation, route, setMenuOpen } = props

  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);

    if ( routeName === 'Profile' ||
          routeName === "SMSDetail" ||
          routeName === "Settings" ||
          routeName === 'HelpSendFeedback' ||  
          routeName === 'About' ||
          routeName === 'Search'
      ) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }

    navigation.setOptions({
      headerLeft: () => (
          <TouchableOpacity onPress={() => {  setMenuOpen()  }} style={styles.menuButton}>
            <Icon name="menu" size={30} />
          </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{padding:10}}
            onPress={() => { navigation.navigate("NewRepost")  }} >
            <Icon name="plus" size={30}  color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{padding:10}}
            onPress={() => { navigation.navigate("Search") }} >
            <Icon name="magnify" size={30}  color="#333" />
          </TouchableOpacity>
          <TabIconWithMenu 
            iconName="dots-vertical"
            menuItems={[
              { label: 'Clear all', onPress: () => {  } },
            ]}/>
        </View>
      ),
      headerShown: true, // hide/show header parent
    });
  }, [navigation, route]);
  
  const { openLoginModal } = useMyContext();
  // const actionSheetRef = useRef<ActionSheet>(null);
  const { state, loadingContext } = useAppContext()
  const dispatch: AppDispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);
  const openMenu = (id: string) => setVisibleMenuId(id);
  const closeMenu = () => setVisibleMenuId(null);
  // const blockList = useSelector((state: RootState) => state.block.blockList );
  const user = useSelector((state: RootState) => state.user.user );
  const toast = useToast();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ url: string }[]>([]);

  const [likeReportId, setLikeReportId] = useState("")
  const [likedIndex, setLikedIndex] = useState(-1)

  const [isMutating, setIsMutating] = useState(false); // Track mutation state

  const [onLikeRepost] = useMutation(mutation_like_report, {
    context: { headers: getHeaders() },
    // optimisticResponse: {
    //   like_report: {
    //     status: true,
    //     data: {
    //       reportId: likeReportId, // The ID of the report being liked
    //       userId: user?._id, // Current user's ID
    //     },
    //     likedIndex: likedIndex === -1 ? 1 : -1 // Optimistic guess for like/unlike
    //   }
    // },
    update: (cache, {data: { like_report }}) => { 
      let { status, data, likedIndex } = like_report;
      // console.log("onLikeRepost :", like_report)
      
      if(status){
        const existingReports = cache.readQuery({ query: query_reports });
        if (existingReports) {
          // Update the repost in the cache
          const updatedReports =  _.map(existingReports?.reports.data, (report)=>{
                                    if (report._id === data.reportId) {
                                      if(report.likes === undefined){
                                        let newReport = { ...report, likes: [{ _id: generateObjectId() , userId: data.userId }] }
                                        return newReport;
                                      }

                                      const updatedLikes = likedIndex !== -1
                                        ? report.likes?.filter(like => like.userId !== data.userId)
                                        : [...report?.likes, { _id: generateObjectId() , userId: data.userId }];

                                      let newReport = { ...report, likes: updatedLikes }
                                      return newReport;
                                    }
                                    return report;
                                  })

          cache.writeQuery({
            query: query_reports,
            data: { 
              reports: {
                ...existingReports.reports, // Keep other fields intact
                data: updatedReports,       // Update the list of reports
              },
            }
          });
        } 
      }
    },
    onCompleted( data ) {
    },
    onError(error: ApolloError){
      handlerError(props, toast, error)
    }
  });

  const { loading: loadingReports, 
          data: dataReports, 
          error: errorReports} = useQuery(query_reports, {
              context: { headers: getHeaders() },
              fetchPolicy: 'cache-first', 
              nextFetchPolicy: 'network-only', 
              notifyOnNetworkStatusChange: false,
              skip: loadingContext, // This will skip the query if the condition is true
          });

  if(errorReports){
    handlerError(props, toast, errorReports)
  }

  useEffect(() => {
    if (!loadingReports && dataReports?.reports) {
      if(dataReports.reports.status){
        setFilteredData(dataReports.reports.data)

        // console.log("ReportsScreen: ", dataReports.reports.data)
      }
    }
  }, [dataReports, loadingReports]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // fetchBlockNumberAll();
    setRefreshing(false);
  }, []);

  const handleUnblock = async(data: any) =>{
    try {
      if(data._id){
        closeMenu();
      }
    } catch (error ) {
      if(error instanceof Error){
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          animationType: "slide-in",
          style: {
            zIndex: 100, // Adjust the zIndex value as needed
          },
        });
      }else{
        console.error("Error fetching call logs:", error);
      }
    }
  }

  const handleShare = async (item: any) => {
    try {
      await Share.open({
        url: "firstImageUrl", // Sharing the first image URL
        message: 'Check out this image', // Optional message
        title: 'Share Image', // Optional title
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  /*
  const click = useCallback(
    _.debounce(async (item: any) => {
      if (_.isEmpty(user)) {
        openLoginModal();
      } else {
        setLikeReportId(item._id);
        setIsMutating(true); // Set the mutation state to true

        try {
          let likedIndex = item?.likes?.some(like => like.userId === user?._id) ? 1 : -1;
          setLikedIndex(likedIndex);

          await onLikeRepost({ variables: { input: { _id: item._id } } });
        } catch (error) {
          console.error("Error liking report:", error);
        } finally {
          setIsMutating(false); // Reset the mutation state after completion
        }
      }
    }, 150), // Adjust the debounce delay as needed
    [user] // Ensure the callback is updated when `user` changes
  );
  */

  const renderHeartItem = (item: any) =>{
    let isLiked = item?.likes?.some(like => like.userId === user?._id)

    function click(item :any){
      if(_.isEmpty(user)){
        openLoginModal()
      }else{
        // let likedIndex = item?.likes?.some(like => like.userId === user?._id) ? 1 : -1
        // setLikeReportId(item._id)
        // setLikedIndex(likedIndex)

        onLikeRepost({ variables:{ input:{ _id: item._id } } })
      }
    } 

    return <TouchableOpacity 
            style={{padding:5, flexDirection: 'row'}}  
            onPress={() => { click(item) }}>
            <Icon 
              name={ isLiked ? "heart" : "heart-outline" } 
              size={16} 
              color={isLiked ? 'red' : '#555'} />
            <Text>{ item?.likes?.length > 0 ? item?.likes?.length : "" }</Text>
          </TouchableOpacity>
  }

  const renderItem = useCallback(({ item }: { item: any }) => {
    // console.log("renderItem :", item?.comment[0]?.data, item?.comment[0] && countTotalComments(item?.comment[0]?.data))
    const isExpanded = expandedItemId === item._id;
    return (
      <View
        style={styles.itemContainer}
        key={item._id}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => {
            // Show ImageViewer when image is pressed
            if(item.current.images) {
              setImageUrls(item.current.images.map((img: any) => ({ url: `http://192.168.1.3:1984/${img.url}` })));
              setImageViewerVisible(true);
            }
          }}>
          {item.current.images
            ? <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: `http://192.168.1.3:1984/${item.current.images[0].url}` }} 
                  style={styles.image} 
                />
                <View style={styles.imageCountContainer}>
                  <Text style={styles.imageCountText}>
                    {item.current.images.length}
                  </Text>
                </View>
              </View>
            : <Icon name="account" size={30} />}
        </TouchableOpacity>
        <View style={styles.detailsContainer} >
          <TouchableOpacity onPress={()=>{ navigation.navigate("ReportDetail", { _id:  item._id}) }} >
            <Text style={styles.name}>{item.current.sellerFirstName} {item.current.sellerLastName}</Text> 
            {
              item.current.additionalInfo.length > 200 
              ? <Text style={styles.name}>
                  {isExpanded ? item.current.additionalInfo : `${item.current.additionalInfo.substring(0, 200)}...`}
                  <TouchableOpacity onPress={() => setExpandedItemId(isExpanded ? null : item._id)}>
                    <Text style={styles.readMoreLess}>{isExpanded ? '' : ' Read More'}</Text>
                  </TouchableOpacity>
                </Text>
              : <Text style={styles.name}>{item.current.additionalInfo}</Text> 
            }
            <Text style={styles.phone}>{item.current.sellingWebsite}</Text>
            {
              _.map(item.current.telNumbers, (value, index)=>{
                return <View key={index}><Text style={styles.phone}>{value.tel}</Text></View>
              })
            }
            <Text style={styles.phone}>{item.createdAt}</Text>
          </TouchableOpacity>
         
          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            { renderHeartItem(item) }
            {/* 
            <TouchableOpacity style={{padding:5}}  onPress={() => { console.log("bookmark") } }>
              <Icon name="bookmark-outline" size={16} color="#555" />
            </TouchableOpacity> 
            */}
            <TouchableOpacity style={{padding:5, flexDirection: 'row'}}  
            onPress={() => { 
              navigation.navigate("Comments", { _id:  item._id})
              /*actionSheetRef.current?.show()*/  
            }}>
              <Icon name="comment-outline" size={16} color="#555" />
              <Text>{ item?.comment[0] && countTotalComments(item?.comment[0]?.data) }</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{padding:5}}  onPress={()=>handleShare(item)}>
              <Icon name="share" size={16} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.menuContainer}>
          <Menu
            visible={visibleMenuId === item._id}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={()=>openMenu(item._id)}>
                <Icon name="dots-vertical" size={24} color="#555" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { handleUnblock(item) }} title="Unblock" />
          </Menu>
        </View>
      </View>
    );
  }, [user, visibleMenuId, expandedItemId]);

  return (
    <View style={styles.container}>
      {
        filteredData.length === 0  ? (
          <TouchableOpacity style={styles.emptyContainer} onPress={()=>{}}>
            <Icon name="file-document-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No Reports Found</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            initialNumToRender={10}
            windowSize={5}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            ItemSeparatorComponent={() => <Divider />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )
      }
      { isImageViewerVisible && <ImageZoomViewer images={imageUrls} isVisible={isImageViewerVisible} onClose={()=>setImageViewerVisible(false)}/> }
      {/* <CommentActionSheet actionSheetRef={actionSheetRef} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    paddingLeft: 5,
    // maxHeight: 500,
  },
  avatarContainer: {
    flex: 3,
    width: 100,
    height: 100,
    // backgroundColor: 'blue',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'red',
    borderWidth: .5,
    borderColor: 'gray',
    borderRadius: 5, 
    margin: 5, 
    // padding: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  detailsContainer: {
    flex: 9,
    // backgroundColor: 'yellow'
    // backgroundColor: 'red',
    paddingTop: 10,
  },
  name: {
    fontWeight: 'bold',
  },
  phone: {
    color: '#555',
  },
  menuContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position:'absolute',
    top:0,
    right:0,
    padding:10
  },
  menuButton: {
    marginLeft: 15
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
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
    // backgroundColor:'blue',
    flexDirection: 'row',
    alignSelf: 'flex-end'
  },
  readMoreLess: {
    color: 'blue',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
});

export default ReportsScreen;