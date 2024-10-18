import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, Dimensions  } from 'react-native';
import { useQuery } from '@apollo/client';
import { useToast } from "react-native-toast-notifications";
import { RouteProp } from '@react-navigation/native';
import _ from "lodash";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { Menu, Divider } from 'react-native-paper';
import Share from 'react-native-share';

import { query_report } from "../gqlQuery";
import { getHeaders } from "../utils";
import handlerError from "../handlerError";

import ImageZoomViewer from "./ImageZoomViewer";
import CommentActionSheet from "./CommentActionSheet";
// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
          <TouchableOpacity style={{padding:5}}  onPress={() => { toast.show("handle like"); /*console.log("handle like")*/  }}>
            <Icon name="heart-outline" size={30} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={{padding:5}}  onPress={() => { toast.show("handle bookmark"); /*console.log("handle bookmark")*/ }}>
            <Icon name="bookmark-outline" size={30} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={{padding:5}}  onPress={() => { actionSheetRef.current?.show() }}>
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
  }, [navigation, route, visibleMenu]);

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
        setData(dataReport.report.data);
      }
    }
  }, [dataReport, loadingReport]);

  const handleActionPress = (action: string) => {
    console.log(`Selected Action: ${action}`);
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

  return (
    <View style={styles.container}>
      {loadingReport && _.isEmpty(data) ? (
        <ActivityIndicator size="large" color="#0000ff" />
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