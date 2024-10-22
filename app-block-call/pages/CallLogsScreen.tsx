import React, { useCallback, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, RefreshControl, FlatList, NativeModules, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Divider } from 'react-native-paper';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import _ from "lodash"
import { useToast } from "react-native-toast-notifications";

import { RootState, AppDispatch } from '../redux/store';
import { getDate } from "../utils";
import BlockReasonModal from './BlockReasonModal'; 
import TabIconWithMenu from "../TabIconWithMenu"
import { CallLog, ItemCall } from "../redux/interface";
import { removeBlock } from "../redux/slices/blockSlice";
import { addMultipleCallLogs, removeCallLog, clearCallLogs } from '../redux/slices/calllogSlice';

const { DatabaseHelper } = NativeModules;

type CallLogsProps = {
  navigation: any;
  route: any;
  setMenuOpen: () => void;
};

interface BlockNumberItem{
  ID: string;
  DETAIL: string;
  NAME: string;
  PHONE_NUMBER: string;
  PHOTO_URI: string | null;
  REPORTER: string;
  CREATE_AT: string;
  UPDATE_AT: string;
}

const CallLogsScreen: React.FC<CallLogsProps> = ({ navigation, route, setMenuOpen }) => {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    // Hide tab bar for certain routes
    if (  routeName === "Profile" || 
          routeName === 'CallLogsDetail' || 
          routeName === 'Search' || 
          routeName === 'Settings' ||
          routeName === 'HelpSendFeedback' || 
          routeName === 'About' ||
          routeName === 'SMSDetail'
        ) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => { setMenuOpen() }} style={styles.menuButton}>
          <Icon name="menu" size={30} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ padding:5, marginRight: 5 }} 
            onPress={()=>{ navigation.navigate("Search") }}>
            <Icon name="magnify" size={30} color="#333" />
          </TouchableOpacity>
          <TabIconWithMenu 
            iconName="dots-vertical"
            menuItems={[
              { label: 'Clear all', onPress: () => removeAllCallLog() },
            ]}/>
        </View>
      ),
      headerShown: true, 
    });
  }, [navigation, route]);

  const [refreshing, setRefreshing] = useState(false);
  const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);

  const openMenu = (id: string) => setVisibleMenuId(id);
  const closeMenu = () => setVisibleMenuId(null);

  const dispatch: AppDispatch = useDispatch();
  const callLogs = useSelector((state: RootState) => state.callLog.callLogs);
  const blockList = useSelector((state: RootState) => state.block.blockList );
  const [blockReasonModal, setBlockReasonModal] = useState<ItemCall | null>(null);

  const toast = useToast();
  let [openItemId, setOpenItemId] = useState<string | null>(null);

  const fetchCallLogs = async () => {
    try {
      const response = await DatabaseHelper.fetchCallLogs();
      if (response.status) {
        dispatch(addMultipleCallLogs(response.data));
      }
    } catch (error) {
      console.error("fetchCallLogs :", error);
    }
  };

  const removeCallLogByNumber = async (item: ItemCall) => {
    try {
      const response = await DatabaseHelper.removeCallLogByNumber(item.number);
      console.log("removeCallLogByNumber :", response)
      if (response.status) {
        dispatch(removeCallLog(item.number));
      }
    } catch (error) {
      console.error("fetchCallLogs :", error);
    }
  };

  const removeAllCallLog = async() => {
    try {
      const response = await DatabaseHelper.removeAllCallLog();
      console.log("removeAllCallLog :", response)
      if (response.status) {
        dispatch(clearCallLogs());
      }
    } catch (error) {
      console.error("fetchCallLogs :", error);
    }
  };

  const openBlockReasonModal = (item: ItemCall) => {
    setBlockReasonModal(item);
  };

  const closeBlockReasonModal = () => {
    setBlockReasonModal(null);
  };

  const handleUnblock = async(data: ItemCall) =>{
    try {
      if(data.number){
        const response = await DatabaseHelper.deleteBlockNumberData(data.number);
        console.log("response :", response);
        if(response.status){
          dispatch(removeBlock(data.number))
  
          toast.show("Unblock.", {
            type: "normal",
            placement: "bottom",
            duration: 4000,
            animationType: "slide-in",
          });
        }
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

  const toggleExpand = (id: string) => {
    setOpenItemId(prevId =>{ return (prevId === id ? null : id) });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const renderItemCall = (type: string) => {
    switch (type) {
      case "1":
        return <Icon name="call-received" size={17} color="#007AFF" style={styles.icon} />;
      case "2":
        return <Icon name="call-made" size={17} color="#007AFF" style={styles.icon} />;
      case "3":
        return <Icon name="call-missed" size={17} color="red" style={styles.icon} />;
      case "4":
        return <Icon name="phone-outline" size={17} color="#007AFF" style={styles.icon} />;
      case "5":
        return <Icon name="call-split" size={17} color="#007AFF" style={styles.icon} />;
    }
  };

  const renderItem2 = useCallback(({ item }: { item: CallLog }) => {
    const itemCall: ItemCall = item.callLogs[0];

    console.log("openItemId ", openItemId, item.number)
    return (
      <TouchableOpacity
        // style={[styles.itemContainer, { backgroundColor: 'blue', flexDirection: 'row' }]}
        onPress={() => { 
          // navigation.navigate("CallLogsDetail", { itemId: itemCall.number }); 
          toggleExpand(item.number)
        }}
        onLongPress={() => Alert.alert("onLongPress")}>
        <View 
          style={{
            flexDirection: 'row', 
            marginVertical: 5,
            padding: 10,
            backgroundColor: '#f8f8f8',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#ddd',}}>
          <View style={[styles.avatarContainer, { backgroundColor :'yellow' }]}>
            {
            itemCall.photoUri
              ? <Image source={{ uri: itemCall.photoUri }} style={styles.image} />
              : <Icon name="account" size={30} />
              // square
            }
            {
              _.find(blockList, (v: BlockNumberItem)=>v.PHONE_NUMBER === item.number) 
              ? <Icon style={styles.addIconContainer} name="cancel" size={30} color="red" />
              : "" 
            }
          </View>
          <View style={[styles.detailsContainer, { backgroundColor: 'red' }]} >
            <Text style={styles.name}>{itemCall.name}</Text>
            <Text style={styles.phone}>{item.number}</Text>
          </View>
          <View style={[styles.timeContainer, {borderLeftColor: 'blue'}]}>
            <Menu
              visible={visibleMenuId === item.number}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity
                  style={{backgroundColor :'yellow'}}
                  onPress={() => openMenu(item.number)}>
                  <Icon name="dots-vertical" size={24} color="#555" />
                </TouchableOpacity>
              }>
              { 
                _.find(blockList, (v: BlockNumberItem)=>v.PHONE_NUMBER === item.number) 
                ? <Menu.Item 
                onPress={() => { handleUnblock(itemCall) }} title="Unblock" />
                : <Menu.Item 
                onPress={() => {
                  openBlockReasonModal(itemCall);
                  closeMenu();
                }} title="Block" />
              }
              <Menu.Item 
                onPress={() => {
                  removeCallLogByNumber(itemCall);
                  closeMenu();
                }} title="Delete" />
            </Menu>
            <View style={[styles.timeAndIconContainer, { backgroundColor:'green' }]}>
              {renderItemCall(itemCall.type)}
              <Text style={styles.time}>{getDate(Number(itemCall.date))}</Text>
            </View>
          </View>

          {/* Check if this item is the open one */}
          {openItemId === item.number && (
            <View style={styles.contentContainer}>
              <Text style={styles.content}>{"item.content"}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [visibleMenuId, blockList, openItemId]);

  const fetchSmsThreadIdLogs = async (number: string) => {
    try {
      console.log("fetchSmsThreadIdLogs :", number)
      const response = await DatabaseHelper.fetchSmsThreadIdLogs(number);
      if (response.status) {
        navigation.navigate('SMSDetail', { thread_id: response.data[0], number });
      } else {
        navigation.navigate('SMSDetail', { thread_id: undefined, number });
      }
    } catch (error) {
      console.error("Error fetchSmsThreadIdLogs :", error);
    }
  };

  const renderItem = ({ item }: { item: CallLog }) => {
    const isExpanded = openItemId === item.number;
    const itemCall: ItemCall = item.callLogs[0];
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity 
          style={[styles.row, { }]} 
          onPress={() => toggleExpand(item.number)}>
           <View style={[styles.avatarContainer, {  }]}>
            {
            itemCall.photoUri
              ? <Image source={{ uri: itemCall.photoUri }} style={styles.image} />
              : <Icon name="account" size={30} />
              // square
            }
            {
              _.find(blockList, (v: BlockNumberItem)=>v.PHONE_NUMBER === item.number) 
              ? <Icon style={styles.addIconContainer} name="cancel" size={30} color="red" />
              : "" 
            }
          </View>
          <View style={[styles.detailsContainer, { }]} >
            <Text style={styles.name}>{itemCall.name}</Text>
            <Text style={styles.phone}>{item.number}</Text>
          </View>
          {/* <View style={[styles.timeContainer, {borderLeftColor: 'blue'}]}>
            <Menu
              visible={visibleMenuId === item.number}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity
                  style={{backgroundColor :'yellow'}}
                  onPress={() => openMenu(item.number)}>
                  <Icon name="dots-vertical" size={24} color="#555" />
                </TouchableOpacity>
              }>
              { 
                _.find(blockList, (v: BlockNumberItem)=>v.PHONE_NUMBER === item.number) 
                ? <Menu.Item 
                onPress={() => { handleUnblock(itemCall) }} title="Unblock" />
                : <Menu.Item 
                onPress={() => {
                  openBlockReasonModal(itemCall);
                  closeMenu();
                }} title="Block" />
              }
              <Menu.Item 
                onPress={() => {
                  removeCallLogByNumber(itemCall);
                  closeMenu();
                }} title="Delete" />
            </Menu>
            
          </View> */}
          <View style={[styles.timeAndIconContainer, { marginRight: 10 }]}>
              {renderItemCall(itemCall.type)}
              <Text style={styles.time}>{getDate(Number(itemCall.date))}</Text>
            </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={[styles.expandedContent, { backgroundColor:'#FFF' }]}>
            <Divider />
            <TouchableOpacity 
              style={{ padding:10, marginRight: 10 }} 
              onPress={()=>{ 
                Linking.openURL(`tel:${itemCall?.number}`) 
              }}>
              <Icon name="phone" size={25} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ padding:10, marginRight: 10 }} 
              onPress={async ()=>{ 
                fetchSmsThreadIdLogs(itemCall?.number || '')
              }}>
              <Icon name="message" size={25} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ padding:10, marginRight: 10 }} 
              onPress={()=>{  
                navigation.navigate("CallLogsDetail", { itemId: itemCall.number });  
              }}>
              <Icon name="information" size={25} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ padding:10, marginRight: 10 }} 
              onPress={()=>{  
                // navigation.navigate("CallLogsDetail", { itemId: itemCall.number });  
              }}>
                
              <Icon name="phone-lock" size={25} color={ _.find(blockList, (v: BlockNumberItem)=>v.PHONE_NUMBER === item.number) ? 'red' : '#999' } />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {callLogs.length === 0 ? (
        <TouchableOpacity style={styles.emptyContainer} onPress={()=>fetchCallLogs()}>
          <Icon name="phone" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No call logs available</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={callLogs}
          renderItem={renderItem}
          keyExtractor={(item) => item.number}
          initialNumToRender={10}
          windowSize={5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          ItemSeparatorComponent={() => <Divider />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      {blockReasonModal && (
        <BlockReasonModal visible={true} phoneNumber={blockReasonModal.number} onClose={closeBlockReasonModal} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // itemContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   // padding: 10,
  // },
  avatarContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#eee',
    marginLeft: 10,
    marginRight: 5,
    // position: 'relative', 
    // padding: 10
  },
  image: {
    // width: '200',
    // height: '200',
    // borderRadius: 35,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    borderRadius: 15,
  },
  detailsContainer: {
    flex: 1,
    // height: '100%'
  },
  name: {
    fontWeight: 'bold',
  },
  phone: {
    color: '#555',
  },
  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeAndIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  time: {
    color: '#888',
    // marginLeft: 5,
  },
  icon: {
    // marginRight: 5,
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
  menuButton: {
    marginLeft: 10,
  },
  contentContainer: {
    // padding: 15,
    // backgroundColor: '#f9f9f9',

  },
  content: {
    fontSize: 14,
    color: '#333',
  },



  itemContainer: {
    // marginVertical: 5,
    // paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderColor: '#ccc',
    // paddingLeft: 5,
    // paddingRight: 5,

    // backgroundColor: 'red'
  },
  row: {
    flexDirection: 'row',  // This ensures horizontal layout
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  title: {
    fontSize: 16,
  },
  expandedContent: {
    // paddingVertical: 10,
    // paddingLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },
});

export default CallLogsScreen;