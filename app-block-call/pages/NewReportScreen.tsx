import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useToast } from "react-native-toast-notifications";
import _ from "lodash"
import {ReactNativeFile} from 'apollo-upload-client';
import DatePicker from 'react-native-date-picker'

import { query_banks, guery_provinces, mutation_report } from "../gqlQuery";

import MultiImageUploader from "./MultiImageUploader"
import { getHeaders } from "../utils";
import { useAppContext } from '../context/DataContext';

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
  const toast = useToast();

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
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [telNumbers, setTelNumbers] = React.useState([{ _id: 0, tel: '' }]);
  const [banks, setBanks]           = React.useState<BankItem[]>([]);
  const [provinces, setProvinces]   = React.useState<ProvinceItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const { state, contextAddBanks, contextAddProvinces } = useAppContext();

  // New state for transferDate
  const [transferDate, setTransferDate] = useState<Date>(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false); // Control date picker modal visibility


  // console.log("NewReportScreen @@@@ :", state.banks, state.provinces)

  // Register the images field in the form
  useEffect(() => {
    register('images'); // This registers the field manually
  }, [register]);

   // Whenever the images state changes, update the form field
   useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const [onReport] = useMutation(mutation_report, {
    context: { headers: getHeaders() },
    update: (cache, { data: { report } }) => {
      console.log("report: ", report);
    },
    onCompleted: (data: any, clientOptions: any) => {
      let { variables: { input } } : any = clientOptions;
      if(input?.mode === 'added'){
        toast.show("Added successfully!", {
          type: "success",
          placement: "bottom",
          duration: 4000,
          animationType: "slide-in",
        });

        navigation.goBack()
      }else if(input?.mode === 'edited'){
        // message.success('Edited successfully!');
        // navigate(-1);
      }

      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      setLoading(false);
      // handlerError(props, error);

      setIsSubmitting(false);
    }
  });

  const { loading: loadingBanks, data: dataBanks } = useQuery(query_banks, {
                                                                context: { headers: getHeaders() },
                                                                fetchPolicy: 'cache-first', 
                                                                nextFetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: false,
                                                                skip: !_.isEmpty(state.banks)
                                                              });

  const { loading: loadingProvinces, data: dataProvinces } = useQuery(guery_provinces, {
                                                                context: { headers: getHeaders() },
                                                                fetchPolicy: 'cache-first', 
                                                                nextFetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: false,
                                                                skip: !_.isEmpty(state.provinces)
                                                              });

  // Handle seller accounts
  const addSellerAccount = () => setSellerAccounts([...sellerAccounts, { _id: sellerAccounts.length, bankId: '', sellerAccount: '' }]);
  const removeSellerAccount = (index: number) => setSellerAccounts(sellerAccounts.filter((_, idx) => idx !== index));

  // Handle telephone numbers
  const addTelNumber = () => setTelNumbers([...telNumbers, { _id: telNumbers.length, tel: '' }]);
  const removeTelNumber = (index: number) => setTelNumbers(telNumbers.filter((_, idx) => idx !== index));

  useEffect(()=>{
    !_.isEmpty(state.banks) && setBanks(state.banks)
    !_.isEmpty(state.provinces) && setProvinces(state.provinces)
  }, [])

  useEffect(() => {
    if (!loadingBanks && dataBanks?.banks) {
      if (dataBanks.banks.status) {
        setBanks(dataBanks.banks.data);

        contextAddBanks(dataBanks.banks.data)
      }
    }
  }, [dataBanks, loadingBanks]);

  useEffect(() => {
    if (!loadingProvinces && dataProvinces?.provinces) {
      if (dataProvinces.provinces.status) {
        setProvinces(dataProvinces.provinces.data);

        contextAddProvinces(dataProvinces.provinces.data)
      }
    }
  }, [dataProvinces, loadingProvinces]);

  const onSubmit = (input: any) => {
    console.log("Form submitted with data:", input);
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
    <ScrollView style={{ padding: 16, backgroundColor: '#fff' }}>
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
          <View key={index} style={{ marginBottom: 5 }}>
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
          <View key={index} style={{ marginBottom: 5 }}>
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
            {/* <View style={{
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
                    <Picker.Item label="เลือกธนาคาร" value="" />
                    {banks.map((bank) => (
                      <Picker.Item key={bank._id} label={bank.name_th} value={bank._id} />
                    ))}
                  </Picker>
                )}
              />
            </View> */}
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
                rules={{ required: `กรุณาเลือกธนาคาร ${index + 1} is required` }} // Required validation added
                render={({ field: { onChange, value } }) => (
                  <Picker
                    style={{
                      height: 50,
                      width: '100%',
                    }}
                    selectedValue={value}
                    onValueChange={onChange}
                  >
                    <Picker.Item label="เลือกธนาคาร" value="" />
                    {banks.map((bank) => (
                      <Picker.Item key={bank._id} label={bank.name_th} value={bank._id} />
                    ))}
                  </Picker>
                )}
              />
             
            </View>
            {errors.sellerAccounts && errors.sellerAccounts[index]?.bankId && (
                <Text style={styles.errorText}>{errors.sellerAccounts[index].bankId.message}</Text>
              )}

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

      {/* Product */}
      <Text>สินค้าที่สั่งซื้อ</Text>
      <Controller
        control={control}
        name="product"
        defaultValue=""
        rules={{ required: 'สินค้าที่สั่งซื้อ is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textInput}
            placeholder="สินค้าที่สั่งซื้อ"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.product && <Text style={styles.errorText}>{errors.product.message}</Text>}

      {/* Transfer Amount */}
      <Text>ยอดโอน</Text>
      <Controller
        control={control}
        name="transferAmount"
        defaultValue=""
        rules={{ required: 'ยอดโอน is required', pattern: { value: /^\d+$/, message: 'Only numbers are allowed' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textInput}
            placeholder="ยอดโอน"
            value={value}
            keyboardType="numeric"
            onChangeText={onChange}
          />
        )}
      />
      {errors.transferAmount && <Text style={styles.errorText}>{errors.transferAmount.message}</Text>}

      {/* Transfer Date */}
      { /*
      <Text>วันโอนเงิน</Text>
      <Controller
        control={control}
        name="transferDate"
        defaultValue=""
        rules={{ required: 'วันโอนเงิน is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.transferDate && <Text style={styles.errorText}>{errors.transferDate.message}</Text>}
      */ }
      <Text style={{ fontSize: 16, fontWeight: '700' }}>วันโอนเงิน</Text>
      <TouchableOpacity
        style={styles.textInput}
        onPress={() => setOpenDatePicker(true)} // Open the date picker modal
      >
        <Text>{transferDate.toDateString()}</Text>
      </TouchableOpacity>
      {errors.transferDate && <Text style={styles.errorText}>{errors.transferDate.message}</Text>}

      {/* Date picker modal */}
      <DatePicker
        modal
        open={openDatePicker}
        date={transferDate}
        mode="date"
        onConfirm={(date) => {
          setOpenDatePicker(false);
          setTransferDate(date); // Set the selected date
        }}
        onCancel={() => setOpenDatePicker(false)}
      />

      {/* Selling Website */}
      <Text>เว็บประกาศขายของ</Text>
      <Controller
        control={control}
        name="sellingWebsite"
        defaultValue=""
        rules={{ required: 'เว็บประกาศขายของ is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textInput}
            placeholder="Enter website"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.sellingWebsite && <Text style={styles.errorText}>{errors.sellingWebsite.message}</Text>}

      {/* Additional Info */}
      <Text>รายละเอียดเพิ่มเติม</Text>
      {/* <Controller
        control={control}
        name="additionalInfo"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textInput}
            placeholder="รายละเอียดเพิ่มเติม"
            value={value}
            onChangeText={onChange}
          />
        )}
      /> */}

      <Controller
        control={control}
        name="additionalInfo"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textInput}
            placeholder="กรุณาใส่รายละเอียดเพิ่มเติม"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4} // Adjust based on your preference
            textAlignVertical="top" // Ensures text starts from the top
          />
        )}
      />
      
      {/* Province Picker */}
      <Text style={{ fontSize: 16, fontWeight: '700' }}>จังหวัด</Text>
      <View style={{
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 10,
      }}>
        <Controller
          control={control}
          name="provinceId"
          defaultValue=""
          rules={{ required: 'กรุณาเลือกจังหวัด' }}
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={selectedProvince}
              onValueChange={(itemValue) => {
                setSelectedProvince(itemValue); // Update state with selected province
                onChange(itemValue); // Also update form state
              }}
            >
              <Picker.Item label="เลือกจังหวัด" value="" />
              {provinces.map((province) => (
                <Picker.Item key={province._id} label={province.name_th} value={province._id} />
              ))}
            </Picker>
          )}
        />
      </View>
      {errors.provinceId && <Text style={styles.errorText}>{errors.provinceId.message}</Text>}


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