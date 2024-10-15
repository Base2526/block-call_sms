import React, { useCallback, useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, 
        TouchableOpacity, Alert, Image, 
        RefreshControl, FlatList, NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Divider } from 'react-native-paper';
import { useToast } from "react-native-toast-notifications";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
// import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { RootState, AppDispatch } from '../redux/store';
// import { formatDate } from "../utils";
// import TabIconWithMenu from "../TabIconWithMenu"
import { BlockItem } from "../redux/interface"

import { addBlocks, removeBlock } from "../redux/slices/blockSlice";

import { query_reports } from "../gqlQuery";
import { getHeaders } from "../utils";
import handlerError from "../handlerError";

const { DatabaseHelper } = NativeModules;

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

  const fetchBlockList = async()=>{
    // try {
    //   const response = await DatabaseHelper.getBlockNumberAllData();
    //   if(response.status){
    //     dispatch(addBlocks(response.data))
    //   }
    // } catch (error ) {
    //   console.error("fetchBlockList : ", error);
    // }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // fetchBlockNumberAll();
    setRefreshing(false);
  }, []);

  const handleUnblock = async(data: any) =>{
    try {
      if(data._id){
        // const response = await DatabaseHelper.deleteBlockNumberData(data.PHONE_NUMBER);
        // console.log("response :", response);
        // if(response.status){
        //   dispatch(removeBlock(data.PHONE_NUMBER))
  
        //   toast.show("Unblock.", {
        //     type: "normal",
        //     placement: "bottom",
        //     duration: 4000,
        //     animationType: "slide-in",
        //   });
        // }
        // fetchBlockNumberAll();
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
    // console.log("url >", item.current.images ? `http://192.168.1.3:1984/${item.current.images[0].url}` : "" )
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => { navigation.navigate("CallLogsDetail", { itemId: item.PHONE_NUMBER }); }}
        onLongPress={() => Alert.alert("onLongPress")}
        key= {item._id}>
        <View style={styles.avatarContainer}>
          {item.current.images
            ? <Image source={{ uri: `http://192.168.1.3:1984/${item.current.images[0].url}` }} style={styles.image} />
            : <Icon name="account" size={30} />}
        </View>
        <View style={styles.detailsContainer} >
          <Text style={styles.name}>{item.current.sellerFirstName} {item.current.sellerLastName}</Text> 
          <Text style={styles.name}>{item.current.additionalInfo}</Text>
          <Text style={styles.phone}>{item.current.sellingWebsite}</Text>
          <Text style={styles.phone}>{item.createdAt}</Text>
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
          {/* 
          <View style={styles.timeAndIconContainer}>
            <Text style={styles.time}>{formatDate(item.UPDATE_AT)}</Text>
          </View> 
          */}
        </View>
      </TouchableOpacity>
    );
  }, [visibleMenuId]);

  return (
    <View style={styles.container}>
      {
        filteredData.length === 0 ? (
          <TouchableOpacity style={styles.emptyContainer} onPress={()=>{fetchBlockList()}}>
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
    alignItems: 'center',
    padding: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5, 
    // backgroundColor: 'red',
    marginRight: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: 'yellow'
  },
  // rightContainer:{
  //   flex: 1,
  //   backgroundColor: 'green'
  // },
  name: {
    fontWeight: 'bold',
  },
  phone: {
    color: '#555',
  },
  menuContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    // backgroundColor:'blue',
    position:'absolute',
    top:0,
    right:0,
    padding:10
  },
  timeAndIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: '#888',
    marginLeft: 5,
  },
  icon: {
    marginRight: 5,
  },
  menuButton: {
    marginLeft: 10,
  },
});

export default ReportsScreen;
