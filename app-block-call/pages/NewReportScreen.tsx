import React, { useState, useEffect, useLayoutEffect } from 'react';
// import { View, TextInput, Text, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { launchImageLibrary } from 'react-native-image-picker';
// import { useForm, Controller } from 'react-hook-form';

import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/Ionicons';

import { guery_report, query_banks, guery_provinces } from "../gqlQuery";

interface ProvinceItem {
  _id: string;
  name_th: string;
  name_en: string;
}

interface BankItem {
  _id: string;
  name_th: string;
  name_en: string;
}

interface SellerAccountsItem {
  _id: number;
  bankId: string;
  sellerAccount: string;
}

const provinces = [
  { _id: '1', name_th: 'กรุงเทพมหานคร' },
  { _id: '2', name_th: 'เชียงใหม่' },
  // Add more provinces here
];

type NewReportScreenProps = {
  navigation: any;
  route: any;
};

const NewReportScreen: React.FC<NewReportScreenProps> = (props) => {
  // let { navigation, route } = props

  const navigation = useNavigation();
  const route = useRoute();

  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
          <TouchableOpacity 
            style={{
              // backgroundColor: '#007bff', // Button background color
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 5, // Optional: rounded corners
            }}
            onPress={handleSubmit} >
            <Text style={{
               fontSize: 18,
               color: '#007bff', // Text color (white)
               fontWeight: 'bold', // Make text bold
            }}>Submit</Text>
          </TouchableOpacity>
        </View>
      ),
      headerShown: true, // hide/show header parent
    });
  }, [navigation, route]);

  // const navigation = useNavigation();
  // const route = useRoute();
  // const { mode, _id } = route.params || {};

  const [sellerFirstName, setSellerFirstName] = useState('');
  const [sellerLastName, setSellerLastName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [sellerAccounts, setSellerAccounts] = useState<SellerAccountsItem[]>([{ _id: 0, bankId: '', sellerAccount: '' }]);
  const [telNumbers, setTelNumbers] = useState([{ _id: 0, tel: '' }]);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Apollo Queries
  const { loading: loadingBanks, data: dataBanks } = useQuery(query_banks);
  const { loading: loadingProvinces, data: dataProvinces } = useQuery(guery_provinces);
  // const { loading: loadingReport, data: dataReport, refetch: refetchReport } = useQuery(guery_report, {
  //   variables: { id: _id }
  // });

  // Handle mutation for report submission
  // const [onReport] = useMutation(mutation_report, {
  //   onCompleted: (data) => {
  //     setLoading(false);
  //     Alert.alert('Success', mode === 'added' ? 'Added successfully!' : 'Edited successfully!');
  //     navigation.goBack();
  //   },
  //   onError: (error) => {
  //     setLoading(false);
  //     Alert.alert('Error', error.message);
  //   }
  // });

  // Handle seller accounts
  const addSellerAccount = () => setSellerAccounts([...sellerAccounts, { _id: sellerAccounts.length, bankId: '', sellerAccount: '' }]);
  const removeSellerAccount = (index: number) => setSellerAccounts(sellerAccounts.filter((_, idx) => idx !== index));

  // Handle telephone numbers
  const addTelNumber = () => setTelNumbers([...telNumbers, { _id: telNumbers.length, tel: '' }]);
  const removeTelNumber = (index: number) => setTelNumbers(telNumbers.filter((_, idx) => idx !== index));

  // useEffect(() => {
  //   console.log("@1 loadingBanks :", dataBanks)
  //   if (!loadingBanks && dataBanks?.banks?.status) {
  //     console.log("@2 loadingBanks :", dataBanks.banks.data)
  //     setBanks(dataBanks.banks.data);
  //   }
  //   // if (!loadingProvinces && dataProvinces?.provinces?.status) {
  //   //   setProvinces(dataProvinces.provinces.data);
  //   // }
  //   // if (mode === 'edited' && !loadingReport && dataReport?.report?.status) {
  //   //   const report = dataReport.report.data;
  //   //   setSellerFirstName(report.sellerFirstName);
  //   //   setSellerLastName(report.sellerLastName);
  //   //   setIdCard(report.idCard);
  //   //   setSellerAccounts(report.sellerAccounts);
  //   //   setTelNumbers(report.telNumbers);
  //   // }
  // }, [dataBanks , dataProvinces ]);

  useEffect(() => {
    if (!loadingBanks && dataBanks?.banks) {
      if(dataBanks.banks.status){
        setBanks(dataBanks.banks.data);
      }
    }
  }, [dataBanks, loadingBanks]);

  const handleSubmit = () => {
    setLoading(true);
    const input = {
      sellerFirstName,
      sellerLastName,
      idCard,
      sellerAccounts,
      telNumbers,
      // mode,
    };
    // onReport({ variables: { input } });
  };

  return (
    <ScrollView style={{ padding: 16 }}>
    {/* <Text> {mode === 'edited' ? 'Edit Report' : 'Add New Report'} </Text> */}

    <Text>Seller First Name</Text>
    <TextInput
      value={sellerFirstName}
      onChangeText={setSellerFirstName}
      placeholder="Enter seller's first name"
    />

    <Text>Seller Last Name</Text>
    <TextInput
      value={sellerLastName}
      onChangeText={setSellerLastName}
      placeholder="Enter seller's last name"
    />

    <Text>ID Card</Text>
    <TextInput
      value={idCard}
      onChangeText={setIdCard}
      placeholder="Enter ID card or passport"
      maxLength={13}
    />

    {/* Dynamic Telephone Numbers */}
    {telNumbers.map((tel, index) => (
      <View key={tel._id}>
        <TextInput
          value={tel.tel}
          onChangeText={(text) => {
            const updatedTels = [...telNumbers];
            updatedTels[index].tel = text;
            setTelNumbers(updatedTels);
          }}
          placeholder={`Telephone/Line ID ${index + 1}`}
        />
        {telNumbers.length > 1 &&  /*<Button title="Remove" onPress={() => removeTelNumber(index)} />*/ 
        <TouchableOpacity 
          style={{
            // backgroundColor: '#007bff', // Button background color
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 5, // Optional: rounded corners
          }}
          onPress={() => removeTelNumber(index)} >
          <Text style={{
            fontSize: 18,
            color: '#007bff', // Text color (white)
            fontWeight: 'bold', // Make text bold
          }}>ลบ</Text>
        </TouchableOpacity>
      }
      </View>
    ))}
    {/* <Button title="Add New Telephone" onPress={addTelNumber} /> */}
    <TouchableOpacity 
      style={{
        // backgroundColor: '#007bff', // Button background color
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5, // Optional: rounded corners
      }}
      onPress={addTelNumber} >
      <Text style={{
        fontSize: 18,
        color: '#007bff', // Text color (white)
        fontWeight: 'bold', // Make text bold
      }}>เพิ่ม</Text>
    </TouchableOpacity>

    {/* Seller Accounts */}
    {sellerAccounts.map((account, index) => (
      <View key={account._id}>
        <Text>Seller Account {index + 1}</Text>
        <TextInput
          value={account.sellerAccount}
          onChangeText={(text) => {
            const updatedAccounts = [...sellerAccounts];
            updatedAccounts[index].sellerAccount = text;
            setSellerAccounts(updatedAccounts);
          }}
          placeholder="Enter seller account"
        />
        {/* <Picker
          selectedValue={account.bankId}
          onValueChange={(itemValue) => {
            const updatedAccounts = [...sellerAccounts];
            updatedAccounts[index].bankId = itemValue;
            setSellerAccounts(updatedAccounts);
          }}
        >
          {banks.map((bank) => (
            <Picker.Item key={bank._id} label={bank.name_th} value={bank._id} />
          ))}
        </Picker> */}
        {
          sellerAccounts.length > 1 &&  /*<Button title="Remove" onPress={() => removeSellerAccount(index)} />*/ 
          <TouchableOpacity 
            style={{
              // backgroundColor: '#007bff', // Button background color
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 5, // Optional: rounded corners
            }}
            onPress={() => removeSellerAccount(index)} >
            <Text style={{
              fontSize: 18,
              color: '#007bff', // Text color (white)
              fontWeight: 'bold', // Make text bold
            }}>ลบ</Text>
          </TouchableOpacity>
        }
      </View>
    ))}
    {/* <Button title="Add New Seller Account" onPress={addSellerAccount} /> */}
    <TouchableOpacity 
      style={{
        // backgroundColor: '#007bff', // Button background color
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5, // Optional: rounded corners
      }}
      onPress={addSellerAccount} >
      <Text style={{
        fontSize: 18,
        color: '#007bff', // Text color (white)
        fontWeight: 'bold', // Make text bold
      }}>เพิ่ม</Text>
    </TouchableOpacity>

    {/* <Button title="Submit" onPress={handleSubmit} />
    {loading && <ActivityIndicator size="large" />} */}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  dateInput: {
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
  }
});

export default NewReportScreen;