import React, { useCallback, useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, 
        TouchableOpacity, Alert, Image, 
        RefreshControl, FlatList, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Divider } from 'react-native-paper';
import { useToast } from "react-native-toast-notifications";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
// import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ImageViewer from 'react-native-image-zoom-viewer';
import _ from "lodash";

import { RootState, AppDispatch } from '../redux/store';
// import { formatDate } from "../utils";
// import TabIconWithMenu from "../TabIconWithMenu"
import { BlockItem } from "../redux/interface"

import { addBlocks, removeBlock } from "../redux/slices/blockSlice";

import { query_reports } from "../gqlQuery";
import { getHeaders } from "../utils";
import handlerError from "../handlerError";

import ImageZoomViewer from "./ImageZoomViewer"

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
            <Icon name="menu" size={24} />
          </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
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
        </View>
      ),
      headerShown: true, // hide/show header parent
    });
  }, [navigation, route]);
  
  const dispatch: AppDispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);
  const openMenu = (id: string) => setVisibleMenuId(id);
  const closeMenu = () => setVisibleMenuId(null);
  const blockList = useSelector((state: RootState) => state.block.blockList );
  const toast = useToast();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ url: string }[]>([]);

  const { loading: loadingReports, 
          data: dataReports, 
          error: errorReports} = useQuery(query_reports, {
              context: { headers: getHeaders() },
              fetchPolicy: 'cache-first', 
              nextFetchPolicy: 'network-only', 
              notifyOnNetworkStatusChange: false,
          });

  if(errorReports){
    handlerError(props, toast, errorReports)
  }

  useEffect(() => {
    if (!loadingReports && dataReports?.reports) {
      console.log("@@@@@@ ReportsScreen > ", dataReports)
      if(dataReports.reports.status){
        console.log("dataReports :", dataReports.reports.data[0])

        setFilteredData(dataReports.reports.data)
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

  const renderItem = useCallback(({ item }: { item: any }) => {
    // console.log(">> ", `http://192.168.1.3:1984/${item.current.images[0].url}` )
    const isExpanded = expandedItemId === item._id;
    return (
      <View
        style={styles.itemContainer}
        key= {item._id}>
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
            // ? <Image source={{ uri: `http://192.168.1.3:1984/${item.current.images[0].url}` }} style={styles.image} />
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
              _.map(item.current.telNumbers, (value)=>{
                return <TouchableOpacity><Text style={styles.phone}>{value.tel}</Text></TouchableOpacity>
              })
            }
            <Text style={styles.phone}>{item.createdAt}</Text>
          </TouchableOpacity>
         
          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={{padding:5}}  onPress={() => { /* handle like */ }}>
              <Icon name="heart-outline" size={16} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity style={{padding:5}}  onPress={() => { /* handle bookmark */ }}>
              <Icon name="bookmark-outline" size={16} color="#555" />
            </TouchableOpacity>
            {/* <TouchableOpacity style={{padding:5}}  onPress={() => {}}>
              <Icon name="comment-outline" size={16} color="#555" />
            </TouchableOpacity> */}
            <TouchableOpacity style={{padding:5}}  onPress={() => { /* handle share */ }}>
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
  }, [visibleMenuId, expandedItemId]);

  return (
    <View style={styles.container}>
      {
        filteredData.length === 0 ? (
          <TouchableOpacity style={styles.emptyContainer} onPress={()=>{}}>
            <Icon name="file-document-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No Reports Found</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.PHONE_NUMBER}
            initialNumToRender={10}
            windowSize={5}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            ItemSeparatorComponent={() => <Divider />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )
      }
      {/* ImageViewer Modal */}
      { isImageViewerVisible && <ImageZoomViewer images={imageUrls} isVisible={isImageViewerVisible} onClose={()=>setImageViewerVisible(false)}/>
       
        // <Modal visible={isImageViewerVisible} transparent={true} onRequestClose={() => setImageViewerVisible(false)}>
        //   <ImageViewer
        //     imageUrls={imageUrls}
        //     enableSwipeDown
        //     onSwipeDown={() => setImageViewerVisible(false)}
        //     onCancel={() => setImageViewerVisible(false)}/>
        // </Modal> 
      }
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
    borderRadius: 5, 
    margin: 5, 
    padding: 2,
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