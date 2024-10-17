import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

import _ from "lodash"
import {ReactNativeFile} from 'apollo-upload-client';

import { query_banks, guery_provinces, mutation_report } from "../gqlQuery";

import MultiImageUploader from "./MultiImageUploader"
import { getHeaders } from "../utils";

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

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

const NewReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 5,
            }}
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)} >
             {isSubmitting ? (
                <ActivityIndicator color="green" />
              ) : (
                <Text style={{
                  fontSize: 18,
                  color: '#007bff',
                  fontWeight: 'bold',
                }}>สร้าง</Text>
              )}
          </TouchableOpacity>
        </View>
      ),
      headerShown: true,
    });
  }, [navigation]);

  const [sellerAccounts, setSellerAccounts] = React.useState<SellerAccountsItem[]>([{ _id: 0, bankId: '', sellerAccount: '' }]);
  const [telNumbers, setTelNumbers] = React.useState([{ _id: 0, tel: '' }]);
  const [banks, setBanks] = React.useState<BankItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Register the images field in the form
  useEffect(() => {
    register('images'); // This registers the field manually
  }, [register]);

   // Whenever the images state changes, update the form field
   useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const [onReport] = useMutation(mutation_report, {
    context: { headers: {  'apollo-require-preflight': 'true'  }},
    update: (cache, { data: { report } }) => {
      console.log("report: ", report);
    },
    onCompleted: (data: any, clientOptions: any) => {
      // setLoading(false);  
      // let { variables: { input } } : any = clientOptions;
      // if(input?.mode === 'added'){
      //   message.success('Added successfully!');
      //   navigate(-1);
      // }else if(input?.mode === 'edited'){
      //   message.success('Edited successfully!');
      //   navigate(-1);
      // }

      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      setLoading(false);
      // handlerError(props, error);

      setIsSubmitting(false);
    }
  });

  /*
    const { loading: loadingReport, 
        data: dataReport, 
        error: errorReport,
        refetch: refetchReport} = useQuery(query_report);
  */

  const { loading: loadingBanks, data: dataBanks } = useQuery(query_banks, {
                                                                // context: { headers: getHeaders() },
                                                                fetchPolicy: 'cache-first', 
                                                                nextFetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: false,
                                                              });
  // const { loading: loadingProvinces, data: dataProvinces } = useQuery(guery_provinces);

  // Handle seller accounts
  const addSellerAccount = () => setSellerAccounts([...sellerAccounts, { _id: sellerAccounts.length, bankId: '', sellerAccount: '' }]);
  const removeSellerAccount = (index: number) => setSellerAccounts(sellerAccounts.filter((_, idx) => idx !== index));

  // Handle telephone numbers
  const addTelNumber = () => setTelNumbers([...telNumbers, { _id: telNumbers.length, tel: '' }]);
  const removeTelNumber = (index: number) => setTelNumbers(telNumbers.filter((_, idx) => idx !== index));

  useEffect(() => {
    if (!loadingBanks && dataBanks?.banks) {
      if (dataBanks.banks.status) {
        setBanks(dataBanks.banks.data);
      }
    }
  }, [dataBanks, loadingBanks]);

  const onSubmit = (input: any) => {
    // console.log("Form submitted with data:", input);
    // Call your mutation or API here with the data

    setIsSubmitting(true);
    let newImages = _.map(input?.images, (assets)=>new ReactNativeFile({
                      uri: assets.uri,
                      name: assets.name,
                      type: assets.type,
                    }))
    onReport({ variables: { input: { ...input, mode: 'added', images: newImages } } });
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700' }}>ชื่อ</Text>
      <Controller
        control={control}
        name="sellerFirstName"
        defaultValue=""
        rules={{ required: 'กรุณากรอกชื่อ' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="ชื่อ"
            style={styles.textInput}
          />
        )}
      />
      {errors.sellerFirstName && <Text style={styles.errorText}>{errors.sellerFirstName.message}</Text>}

      <Text style={{ fontSize: 16, fontWeight: '700' }}>นามสกุล</Text>
      <Controller
        control={control}
        name="sellerLastName"
        defaultValue=""
        rules={{ required: 'กรุณากรอกนามสกุล' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="นามสกุล"
            style={styles.textInput}
          />
        )}
      />
      {errors.sellerLastName && <Text style={styles.errorText}>{errors.sellerLastName.message}</Text>}

      <Text style={{ fontSize: 16, fontWeight: '700' }}>เลขที่บัตรประชาชน/Passport</Text>
      <Controller
        control={control}
        name="idCard"
        defaultValue=""
        rules={{ required: 'กรุณากรอกเลขที่บัตรประชาชน/Passport' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="เลขที่บัตรประชาชน/Passport"
            maxLength={13}
            style={styles.textInput}
          />
        )}
      />
      {errors.idCard && <Text style={styles.errorText}>{errors.idCard.message}</Text>}

      {/* Dynamic Telephone Numbers */}
      <Text style={{ fontSize: 16, fontWeight: '700' }}>เบอร์โทรศัพท์/Line ID</Text>
      <View style={{ borderWidth: .5, borderColor: '#ccc', borderRadius: 10, padding: 5, marginBottom: 10 }}>
        {telNumbers.map((tel, index) => (
          <View key={tel._id} style={{ marginBottom: 5 }}>
            <Controller
              control={control}
              name={`telNumbers.${index}.tel`}
              defaultValue=""
              rules={{ required: `เบอร์โทรศัพท์/Line ID ${index + 1} is required` }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder={`เบอร์โทรศัพท์/Line ID ${index + 1}`}
                  style={styles.textInput}
                />
              )}
            />
            {errors.telNumbers && errors.telNumbers[index] && <Text style={styles.errorText}>{errors.telNumbers[index].tel.message}</Text>}
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
      <Text style={{ fontSize: 16, fontWeight: '700' }}>บัญชีธนาคาร</Text>
      <View style={{ borderWidth: .5, borderColor: '#ccc', borderRadius: 10, padding: 5, marginBottom: 20 }}>
        {sellerAccounts.map((account, index) => (
          <View key={account._id} style={{ marginBottom: 5 }}>
            <Text>เลขบัญชี {index + 1}</Text>
            <Controller
              control={control}
              name={`sellerAccounts.${index}.sellerAccount`}
              defaultValue=""
              rules={{ required: `เลขบัญชี ${index + 1} is required` }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="เลขบัญชี"
                  style={styles.textInput}
                />
              )}
            />
            {errors.sellerAccounts && errors.sellerAccounts[index] && <Text style={styles.errorText}>{errors.sellerAccounts[index].sellerAccount.message}</Text>}
            <Text>ธนาคาร {index + 1}</Text>
            <View style={{
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 5,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}>
              <Controller
                control={control}
                name={`sellerAccounts.${index}.bankId`}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <Picker
                    style={{
                      height: 50,
                      width: '100%',
                    }}
                    selectedValue={value}
                    onValueChange={onChange}
                  >
                    {banks.map((bank) => (
                      <Picker.Item key={bank._id} label={bank.name_th} value={bank._id} />
                    ))}
                  </Picker>
                )}
              />
            </View>
            {sellerAccounts.length > 1 &&
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: 5,
                }}
                onPress={() => removeSellerAccount(index)} >
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
      {loading && <ActivityIndicator />}

      <MultiImageUploader onImages={setImages} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default NewReportScreen;