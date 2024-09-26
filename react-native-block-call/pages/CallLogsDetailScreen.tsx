import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, NativeModules, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useSelector, useDispatch } from 'react-redux';
import _ from "lodash"
import { useToast } from "react-native-toast-notifications";

import { RootState, AppDispatch } from '../redux/store';
import { CallLog } from "../redux/interface";
import * as utils from "../utils";
import BlockReasonModal from './BlockReasonModal'; 
import { removeBlock } from "../redux/slices/blockSlice";

const { DatabaseHelper } = NativeModules;

const CallLogsDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const dispatch: AppDispatch = useDispatch();

  const handleExpand = () => setIsExpanded(!isExpanded);

  const blockList = useSelector((state: RootState) => state.block.blockList );

  const toast = useToast();

  const fetchCallLogByNumber = async (number: string) => {
    setLoading(true); // Start loading
    try {
      const response = await DatabaseHelper.fetchCallLogByNumber(number);
      if (response.status) {
        setData(response.data[0]);
      }
    } catch (error) {
      console.error("fetchCallLogByNumber :", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const onUnblock = async(number: string) =>{
    try {
      if(number){
        const response = await DatabaseHelper.deleteBlockNumberData(number);
        console.log("response :", response);
        if(response.status){
          dispatch(removeBlock(number))
  
          toast.show("Unblock.", {
            type: "normal",
            placement: "bottom",
            duration: 4000,
            animationType: "slide-in",
          });
        }
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

  useEffect(() => {
    fetchCallLogByNumber(route.params.itemId);
  }, []);

  const renderItemCallIcon = (type: string) => {
    switch (type) {
      case "1":
        return <Icon name="call-received" size={25} color="#007AFF" style={styles.icon} />;
      case "2":
        return <Icon name="call-made" size={25} color="#007AFF" style={styles.icon} />;
      case "3":
        return <Icon name="call-missed" size={25} color="red" style={styles.icon} />;
      case "4":
        return <Icon name="phone-outline" size={25} color="#007AFF" style={styles.icon} />;
      case "5":
        return <Icon name="call-split" size={25} color="#007AFF" style={styles.icon} />;
    }
  };

  const renderItemCallText = (type: string) => {
    switch (type) {
      case "1":
        return "Incoming call";
      case "2":
        return "Outgoing call";
      case "3":
        return "Missed call";
      case "4":
        return "Rejected call";
      case "5":
        return "Blocked call";
    }
  };

  const fetchSmsThreadIdLogs = async (number: string) => {
    try {
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

  if(data === null){
    return  <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text>Loading...</Text>
            </View>
  }

  return (
    <View style={styles.container}>
      {loading ? ( // Show loading indicator while fetching data
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {data?.callLogs[0].photoUri ? (
                <Image source={{ uri: data.callLogs[0].photoUri }} style={styles.avatar} />
              ) : (
                <Icon name="account" size={80} color="#aaa" style={styles.avatar} />
              )}
            </View>
            <Text style={styles.nameText}>{data?.callLogs[0].name}</Text>
            <Text style={styles.headerText}>{data?.number}</Text>
            <Text style={styles.subHeaderText}>No results found</Text>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(`tel:${data?.number}`)}>
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={async () => fetchSmsThreadIdLogs(data?.number || '')}>
              <Text style={styles.actionText}>SMS</Text>
            </TouchableOpacity>
              {
                _.find(blockList, (v) => v.PHONE_NUMBER === route.params.itemId)
                ? <TouchableOpacity style={styles.actionButton} onPress={()=>{ onUnblock(route.params.itemId) }}>
                    <Text style={styles.actionText}>Unblock</Text>
                  </TouchableOpacity>
                : <TouchableOpacity style={styles.actionButton} onPress={openModal}>
                    <Text style={styles.actionText}>Block</Text>
                  </TouchableOpacity>
              }
          </View>
          <View style={styles.callHistoryContainer}>
            <ScrollView style={[styles.callHistory, isExpanded ? { maxHeight: 250 } : { maxHeight: 100 }]} nestedScrollEnabled={true}>
              {data?.callLogs.map((call, index) => (
                <View key={index} style={{ flexDirection: 'row' }}>
                  {renderItemCallIcon(call.type)}
                  <View>
                    <Text style={styles.callText}>{utils.getDate(Number(call.date), "YYYY/MM/DD Day HH:mm")}</Text>
                    <Text style={styles.callSubText}>{renderItemCallText(call.type)} • 31s</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            {data?.callLogs.length > 2 && (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity onPress={handleExpand} style={{ width: 80, alignItems: 'center', padding: 5 }}>
                  <Text style={styles.moreButton}>{isExpanded ? 'Show Less' : 'More'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TextInput style={styles.input} placeholder="Tell us who this is" />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchText}>Search more info for this number</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {isModalVisible && <BlockReasonModal visible={isModalVisible} phoneNumber={route.params.itemId} onClose={closeModal} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#aaa',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  actionText: {
    fontSize: 16,
  },
  callHistoryContainer: {
    marginBottom: 16,
  },
  callHistory: {
    marginBottom: 16,
  },
  callText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  callSubText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  moreButton: {
    color: '#007bff',
  },
  searchButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  searchText: {
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
  },
});

export default CallLogsDetailScreen;