import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Picker } from '@react-native-picker/picker';

import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/Ionicons';

import { query_banks, guery_provinces } from "../gqlQuery";

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

const NewReportScreen: React.FC = () => {
  // let { navigation, route } = props

  const navigation = useNavigation();
  const route = useRoute();

  useLayoutEffect(() => {
    // const routeName = getFocusedRouteNameFromRoute(route);

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
          <TouchableOpacity 
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 5, // Optional: rounded corners
            }}
            onPress={handleSubmit} >
            <Text style={{
               fontSize: 18,
               color: '#007bff', // Text color (white)
               fontWeight: 'bold', // Make text bold
            }}>สร้าง</Text>
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
  // Error states
  const [errors, setErrors] = useState({
    sellerFirstName: '',
    sellerLastName: '',
    idCard: '',
    telNumbers: [] as string[],
    sellerAccounts: [] as string[],
  });

  // Apollo Queries
  const { loading: loadingBanks, data: dataBanks } = useQuery(query_banks);
  const { loading: loadingProvinces, data: dataProvinces } = useQuery(guery_provinces);

  // Handle seller accounts
  const addSellerAccount = () => setSellerAccounts([...sellerAccounts, { _id: sellerAccounts.length, bankId: '', sellerAccount: '' }]);
  const removeSellerAccount = (index: number) => setSellerAccounts(sellerAccounts.filter((_, idx) => idx !== index));

  // Handle telephone numbers
  const addTelNumber = () => setTelNumbers([...telNumbers, { _id: telNumbers.length, tel: '' }]);
  const removeTelNumber = (index: number) => setTelNumbers(telNumbers.filter((_, idx) => idx !== index));

  useEffect(() => {
    if (!loadingBanks && dataBanks?.banks) {
      if(dataBanks.banks.status){
        setBanks(dataBanks.banks.data);
      }
    }
  }, [dataBanks, loadingBanks]);

  useEffect(()=>{
    console.log("sellerFirstName %%% ", sellerFirstName)
  }, [sellerFirstName])


  const validateFields = () => {
    let valid = true;
    const newErrors = {
      sellerFirstName: '',
      sellerLastName: '',
      idCard: '',
      telNumbers: [] as string[],
      sellerAccounts: [] as string[],
    };
  
    if (sellerFirstName.trim() === '') {
      newErrors.sellerFirstName = `กรุณากรอกชื่อ - ${ sellerFirstName }`;
      valid = false;  // Set to false if validation fails
    }
  
    if (sellerLastName.trim() === '') {
      newErrors.sellerLastName = 'กรุณากรอกนามสกุล';
      valid = false;
    }
  
    if (idCard.trim() === '') {
      newErrors.idCard = 'กรุณากรอกเลขที่บัตรประชาชน/Passport';
      valid = false;
    }
  
    telNumbers.forEach((tel, index) => {
      if (!tel.tel) {
        newErrors.telNumbers[index] = `เบอร์โทรศัพท์/Line ID ${index + 1} is required`;
        valid = false;
      }
    });
  
    sellerAccounts.forEach((account, index) => {
      if (!account.sellerAccount) {
        newErrors.sellerAccounts[index] = `เลขบัญชี ${index + 1} is required`;
        valid = false;
      }
    });
  
    console.log("validateFields :", newErrors, sellerFirstName);
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = () => {
    console.log("handleSubmit @@@1")
    if (validateFields()) {
      setLoading(true);
      const input = {
        sellerFirstName,
        sellerLastName,
        idCard,
        sellerAccounts,
        telNumbers,
      };
      // Call the mutation here

      console.log("handleSubmit @@@2", input)
    }
    // onReport({ variables: { input } });
  };

  return (
    <ScrollView style={{ padding: 16 }}>
    {/* <Text> {mode === 'edited' ? 'Edit Report' : 'Add New Report'} </Text> */}

    <Text style={{fontSize:16, fontWeight:'700'}}>ชื่อ</Text>
    <TextInput
      value={sellerFirstName}
      onChangeText={(text) => {
        setSellerFirstName(text);
        validateFields(); 
      }}
      placeholder="ชื่อ"
      style={styles.textInput}
    />
    {errors.sellerFirstName ? <Text style={styles.errorText}>{errors.sellerFirstName}</Text> : null}

    <Text style={{fontSize:16, fontWeight:'700'}}>นามสกุล</Text>
    <TextInput
      value={sellerLastName}
      onChangeText={(text) => {
        setSellerLastName(text);
        validateFields(); 
      }}
      placeholder="นามสกุล"
      style={styles.textInput}
    />
    {errors.sellerLastName ? <Text style={styles.errorText}>{errors.sellerLastName}</Text> : null}

    <Text style={{fontSize:16, fontWeight:'700'}}>เลขทีบัตรปะชาขน/Passport</Text>
    <TextInput
      value={idCard}
      onChangeText={setIdCard}
      placeholder="เลขทีบัตรปะชาขน/Passport"
      maxLength={13}
      style={styles.textInput}
    />
    {errors.idCard ? <Text style={styles.errorText}>{errors.idCard}</Text> : null}

    {/* Dynamic Telephone Numbers */}
    <Text style={{fontSize:16, fontWeight:'700'}}>เบอร์โทรศัพท์/Line ID</Text>
    <View style={{ borderWidth: .5, borderColor: '#ccc', borderRadius: 10, padding: 5, marginBottom: 10 }}>
      {telNumbers.map((tel, index) => (
        <View key={tel._id} style={{ marginBottom: 5}}>
          <TextInput
            value={tel.tel}
            onChangeText={(text) => {
              const updatedTels = [...telNumbers];
              updatedTels[index].tel = text;
              setTelNumbers(updatedTels);
            }}
            placeholder={`เบอร์โทรศัพท์/Line ID ${index + 1}`}
            style={styles.textInput}
          />
          {errors.telNumbers[index] ? <Text style={styles.errorText}>{errors.telNumbers[index]}</Text> : null}
          {telNumbers.length > 1 &&  
          <TouchableOpacity 
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 5,
            }}
            onPress={() => removeTelNumber(index)} >
            <Text style={{
              fontSize: 18,
              color: '#007bff', 
              fontWeight: 'bold', 
            }}>ลบ</Text>
          </TouchableOpacity>
        }
        </View>
      ))}
      <TouchableOpacity 
        style={{
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 5
        }}
        onPress={addTelNumber} >
        <Text style={{
          fontSize: 18,
          color: '#007bff',
          fontWeight: 'bold', 
        }}>เพิ่ม</Text>
      </TouchableOpacity>
    </View>

    {/* Seller Accounts */}
    <Text style={{fontSize:16, fontWeight:'700'}}>บัญชีธนาคาร</Text>
    <View style={{ borderWidth: .5, borderColor: '#ccc', borderRadius: 10, padding: 5, marginBottom: 20 }}>
      {sellerAccounts.map((account, index) => (
        <View key={account._id} style={{ marginBottom: 5}}>
          <Text>เลขบัญชี {index + 1}</Text>
          <TextInput
            value={account.sellerAccount}
            onChangeText={(text) => {
              const updatedAccounts = [...sellerAccounts];
              updatedAccounts[index].sellerAccount = text;
              setSellerAccounts(updatedAccounts);
            }}
            placeholder="เลขบัญชี"
            style={styles.textInput}
          />
          {errors.sellerAccounts[index] ? <Text style={styles.errorText}>{errors.sellerAccounts[index]}</Text> : null}

          <Text>ธนาคาร {index + 1}</Text>
          <View style={{
            borderColor: '#ccc', // Border color
            borderWidth: 1, // Border width
            borderRadius: 5, // Rounded corners
            overflow: 'hidden', // Ensures rounded corners are visible
            backgroundColor: '#fff', // Background color
          }}>
            <Picker
              style={{
                height: 50, // Height of the picker
                width: '100%', // Width of the picker
                }}
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
            </Picker>
          </View>
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
      <TouchableOpacity 
        style={{
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 5,
        }}
        onPress={addSellerAccount} >
        <Text style={{
          fontSize: 18,
          color: '#007bff', 
          fontWeight: 'bold', 
        }}>เพิ่ม</Text>
      </TouchableOpacity>
    </View>
   

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
  },
  textInput: {
    height: 50,
    borderColor: '#ccc', // Border color
    borderWidth: 1, // Border width
    borderRadius: 5, // Rounded corners
    paddingHorizontal: 10, // Horizontal padding
    fontSize: 16, // Font size
    color: '#000', // Text color
    backgroundColor: '#fff', // Background color
    marginBottom: 10
  },
});

export default NewReportScreen;