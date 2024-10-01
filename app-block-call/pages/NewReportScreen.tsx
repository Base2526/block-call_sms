import React, { useState } from 'react';
import { View, TextInput, Text, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { launchImageLibrary } from 'react-native-image-picker';
// import { useForm, Controller } from 'react-hook-form';

interface FormValues {
  sellerFirstName: string;
  sellerLastName: string;
  idCard: string;
  sellerAccount: string;
  bank: string;
  product: string;
  transferAmount: number;
  transferDate: Date;
  sellingWebsite: string;
  provinceId: string;
  additionalInfo?: string;
  images: any[];
}

const provinces = [
  { _id: '1', name_th: 'กรุงเทพมหานคร' },
  { _id: '2', name_th: 'เชียงใหม่' },
  // Add more provinces here
];

const NewReportScreen: React.FC = () => {
  // const { control, handleSubmit, formState: { errors } } = useForm<FormValues>();
  // const [images, setImages] = useState<any[]>([]);
  // const [date, setDate] = useState<Date | undefined>(new Date());
  // const [loading, setLoading] = useState(false);

  // const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // const onSubmit = (data: FormValues) => {
  //   console.log(data);
  // };

  // const handleImagePick = () => {
  //   launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, (response) => {
  //     if (!response.didCancel && response.assets) {
  //       setImages(response.assets);
  //     }
  //   });
  // };

  // const showDatePicker = () => {
  //   setDatePickerVisibility(true);
  // };

  // const hideDatePicker = () => {
  //   setDatePickerVisibility(false);
  // };

  // const handleConfirm = (date: Date) => {
  //   setSelectedDate(date);
  //   hideDatePicker();
  // };

  return (
    <></>
    // <ScrollView contentContainerStyle={styles.container}>
    //   <Text>ชื่อคนขาย (ภาษาไทย)</Text>
    //   <Controller
    //     control={control}
    //     name="sellerFirstName"
    //     rules={{ required: 'กรุณากรอกชื่อคนขาย' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกชื่อคนขาย"
    //         onChangeText={onChange}
    //         value={value}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.sellerFirstName && <Text style={styles.errorText}>{errors.sellerFirstName.message}</Text>}

    //   <Text>นามสกุล (ภาษาไทย)</Text>
    //   <Controller
    //     control={control}
    //     name="sellerLastName"
    //     rules={{ required: 'กรุณากรอกนามสกุลคนขาย' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกนามสกุลคนขาย"
    //         onChangeText={onChange}
    //         value={value}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.sellerLastName && <Text style={styles.errorText}>{errors.sellerLastName.message}</Text>}

    //   <Text>เลขบัตรประชาชนคนขาย</Text>
    //   <Controller
    //     control={control}
    //     name="idCard"
    //     rules={{ required: 'กรุณากรอกเลขบัตรประชาชน' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกเลขบัตรประชาชน"
    //         keyboardType="numeric"
    //         maxLength={13}
    //         onChangeText={onChange}
    //         value={value}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.idCard && <Text style={styles.errorText}>{errors.idCard.message}</Text>}

    //   <Text>บัญชีคนขาย</Text>
    //   <Controller
    //     control={control}
    //     name="sellerAccount"
    //     rules={{ required: 'กรุณากรอกบัญชีคนขาย' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกบัญชีคนขาย"
    //         onChangeText={onChange}
    //         value={value}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.sellerAccount && <Text style={styles.errorText}>{errors.sellerAccount.message}</Text>}

    //   <Text>เลือกธนาคาร</Text>
    //   <Controller
    //     control={control}
    //     name="bank"
    //     rules={{ required: 'กรุณาเลือกธนาคาร' }}
    //     render={({ field: { onChange, value } }) => (
    //       <Picker selectedValue={value} onValueChange={onChange}>
    //         <Picker.Item label="ไทยพาณิชย์ (SCB)" value="scb" />
    //         <Picker.Item label="กสิกรไทย (KBank)" value="kbank" />
    //         <Picker.Item label="กรุงเทพ (BBL)" value="bbl" />
    //       </Picker>
    //     )}
    //   />
    //   {errors.bank && <Text style={styles.errorText}>{errors.bank.message}</Text>}

    //   <Text>สินค้าที่สั่งซื้อ</Text>
    //   <Controller
    //     control={control}
    //     name="product"
    //     rules={{ required: 'กรุณากรอกสินค้าที่สั่งซื้อ' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกสินค้าที่สั่งซื้อ"
    //         onChangeText={onChange}
    //         value={value}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.product && <Text style={styles.errorText}>{errors.product.message}</Text>}

    //   <Text>ยอดโอน</Text>
    //   <Controller
    //     control={control}
    //     name="transferAmount"
    //     rules={{ required: 'กรุณากรอกยอดโอน' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกยอดโอน"
    //         keyboardType="numeric"
    //         onChangeText={onChange}
    //         value={value ? value.toString() : ''}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.transferAmount && <Text style={styles.errorText}>{errors.transferAmount.message}</Text>}

    //   <Text>วันโอนเงิน</Text>
    //   <Controller
    //     control={control}
    //     name="transferDate"
    //     rules={{ required: 'กรุณากรอกวันโอนเงิน' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกวันโอนเงิน (เช่น 01/01/2024)"
    //         onChangeText={onChange}
    //         value={value ? new Date(value).toLocaleDateString() : ''}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.transferDate && <Text>{errors.transferDate.message}</Text>}

    //   <Text>เว็บประกาศขายของ</Text>
    //   <Controller
    //     control={control}
    //     name="sellingWebsite"
    //     rules={{ required: 'กรุณากรอกเว็บประกาศขายของ' }}
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกเว็บประกาศขายของ"
    //         onChangeText={onChange}
    //         value={value}
    //         style={styles.input}
    //       />
    //     )}
    //   />
    //   {errors.sellingWebsite && <Text style={styles.errorText}>{errors.sellingWebsite.message}</Text>}

    //   <Text>จังหวัดของคนสร้างรายงาน</Text>
    //   <Controller
    //     control={control}
    //     name="provinceId"
    //     rules={{ required: 'กรุณาเลือกจังหวัด' }}
    //     render={({ field: { onChange, value } }) => (
    //       <Picker selectedValue={value} onValueChange={onChange}>
    //         {provinces.map((province, index) => (
    //           <Picker.Item key={index} label={province.name_th} value={province._id} />
    //         ))}
    //       </Picker>
    //     )}
    //   />
    //   {errors.provinceId && <Text style={styles.errorText}>{errors.provinceId.message}</Text>}

    //   <Text>รายละเอียดเพิ่มเติม</Text>
    //   <Controller
    //     control={control}
    //     name="additionalInfo"
    //     render={({ field: { onChange, value } }) => (
    //       <TextInput
    //         placeholder="กรุณากรอกรายละเอียดเพิ่มเติม"
    //         onChangeText={onChange}
    //         value={value}
    //         style={[styles.input, { height: 100 }]}
    //         multiline
    //       />
    //     )}
    //   />

    //   <Text>ไฟล์แนบ</Text>
    //   <Button title="อัพโหลดไฟล์" onPress={handleImagePick} />

    //   <Button title="ส่งข้อมูล" onPress={handleSubmit(onSubmit)} disabled={loading} />
    // </ScrollView>
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