import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Typography, Skeleton } from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import _ from "lodash";
import moment from 'moment';
import { useLocation, useNavigate } from "react-router-dom";
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import AttackFileField from "@/components/basic/attack-file";
import { query_report, query_provinces, mutation_report, query_banks } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';

const { Title } = Typography;

interface ProvinceItem {
  id: string;
  name_th: string;
  name_en: string;
}

interface BankItem{
  id: string;
  name_th: string;
  name_en: string;
  description: string;
}

interface SellerAccountsItem{
  _id: string;
  bankId: string;
  sellerAccount: string;
}

enum TelNumberMode {
  New = 'new',
  Edited = 'edited',
  Deleted = 'deleted',
}

enum SellerAccountMode {
  New = 'new',
  Edited = 'edited',
  Deleted = 'deleted',
}

type ISellerAccount = {
  id: number;
  bank_id: string;
  bank_name: string;
  mode: SellerAccountMode; 
};

type ITelNumber = {
  id: number;
  tel: string;
  mode: TelNumberMode; 
};

const { Option } = Select;
const ReportForm: React.FC = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, _id } = location.state || {};

  const [loadingSkeleton, setLoadingSkeleton] = useState(mode === 'edited' ? true : false); 

  const [form] = Form.useForm();
  const [images, setImages] = useState<File[]>([]);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(false); 
  const [sellerAccounts, setSellerAccounts] = useState<ISellerAccount[]>([{ id: Date.now(), bank_id: "", bank_name: "", mode: SellerAccountMode.New }]);
  const [telNumbers, setTelNumbers] = useState<ITelNumber[]>([{ id: Date.now(), tel: '', mode: TelNumberMode.New }]);

  const [initialValues, setInitialValues] = useState<any>(null); 
  const [isFormChanged, setIsFormChanged] = useState(false); 

  const addSellerAccount = () => {
    setSellerAccounts([...sellerAccounts, { id: Date.now(),  bank_id: "", bank_name: "", mode: SellerAccountMode.New }]);
  };

  const removeSellerAccount = (index: number) => {
    setSellerAccounts(prev => prev.map((item, i) => i === index ? { ...item, mode: SellerAccountMode.Deleted } : item ) );
  };

  const addTelNumber = () => {
    setTelNumbers([...telNumbers, { id: Date.now(), tel: '', mode: TelNumberMode.New }]);
  };

  const removeTelNumber = (index: number) => {
    setTelNumbers(prev => prev.map((item, i) => i === index ? { ...item, mode: TelNumberMode.Deleted } : item ) );
  };

  const [onReport] = useMutation(mutation_report, {
    context: { headers: getHeaders(location) },
    update: (cache, { data: { report } }) => {
      console.log("report: ", report);
    },
    onCompleted: (data, clientOptions) => {
      setLoading(false);  
      let { variables: { input } } : any = clientOptions;
      if(input?.mode === 'added'){
        message.success('Added successfully!');
        navigate(-1);
      }else if(input?.mode === 'edited'){
        message.success('Edited successfully!');
        navigate(-1);
      }
    },
    onError: (error) => {
      setLoading(false);
      handlerError(props, error);
    }
  });

  const { loading: loadingBanks, 
    data: dataBanks, 
    error: errorBanks} = useQuery(query_banks, {
    context: { headers: getHeaders(location) },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
    });

  if (errorBanks) {
    handlerError(props, errorBanks);
  }
  useEffect(() => {
    if (!loadingBanks && dataBanks?.banks) {
      setBanks([]);
      if (dataBanks?.banks.status) {
        setBanks(dataBanks?.banks.data);
      }
    }
  }, [dataBanks, loadingBanks]);

  const { loading: loadingProvinces, 
          data: dataProvinces, 
          error: errorProvinces } = useQuery(query_provinces, {
    context: { headers: getHeaders(location) },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  });

  if (errorProvinces) {
    handlerError(props, errorProvinces);
  }
  useEffect(() => {
    if (!loadingProvinces && dataProvinces?.provinces) {
      setProvinces([]);
      if (dataProvinces?.provinces.status) {
        _.map(dataProvinces?.provinces.data, (e) => {
          setProvinces((prevItems) => Array.isArray(prevItems) ? [...prevItems, e] : [e]);
        });
      }
    }
  }, [dataProvinces, loadingProvinces]);

  const { loading: loadingReport, 
    data: dataReport, 
    error: errorReport,
    refetch: refetchReport } = useQuery(query_report, {
        context: { headers: getHeaders(location) },
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: false,
        skip: mode === 'added'
    }
  );

  if (errorReport) {
    handlerError(props, errorReport);
  }

  useEffect(() => {
    if (mode === 'edited') {
      if (!loadingReport && dataReport?.report) {
        if (dataReport.report.status) {
          let report = dataReport.report.data;

          const initialData = {
            seller_first_name: report.seller_first_name,
            seller_last_name: report.seller_last_name,
            id_card: report.id_card,
            tel_numbers: report.tel_numbers,
            seller_accounts: report.seller_accounts,
            product: report.product,
            transfer_amount: report.transfer_amount,
            transfer_date: moment(report.transfer_date),
            selling_website: report.selling_website,
            province_id: report.province?.[0]?.id,
            additional_info: report.additional_info,
          };

          console.log("ReportForm  @@1 :", report, report.province?.[0]?.id, initialData);

          // form.setFieldsValue(initialData);
          setInitialValues(initialData); // Set initial values
          setSellerAccounts(report.seller_accounts);
          setTelNumbers(report.tel_numbers);
          setImages(report.images);
        }
      }
    }
  }, [dataReport, loadingReport]);

  useEffect(() => {
    if (mode === 'edited') {
      refetchReport({ id: _id });
    }
  }, [mode, refetchReport]);

  // useEffect(()=>{
  //   console.log("images @@@ :", images)
  // }, [images])

  useEffect(() => {
    if (initialValues && provinces.length > 0 && banks.length > 0) {
      form.setFieldsValue(initialValues);

      setLoadingSkeleton(false);
    }
  }, [initialValues, provinces, banks]);

  // Handle form value changes
  const handleValuesChange = (changedValues: any) => {
    const currentValues = form.getFieldsValue();
    console.log("handleValuesChange :", currentValues, initialValues)

    setIsFormChanged(!_.isEqual(currentValues, initialValues));

    // if ('tel_numbers' in changedValues) {
    //   const telChanged = changedValues.tel_numbers;
    //   console.log('Changed tel number:', telChanged);
    // }
  };

  const handleTelChange = (index: number, value: string) => {
    // Get current tel_numbers from form
    const currentValues = form.getFieldValue('tel_numbers') || [];
  
    // Clone form array and ensure index is initialized
    const updatedFormValues = [...currentValues];
    updatedFormValues[index] = {
      ...(updatedFormValues[index] || {}),
      tel: value,
    };
  
    // Update Ant Design Form state
    form.setFieldsValue({ tel_numbers: updatedFormValues });
  
    // Update local telNumbers state
    setTelNumbers(prev => {
      const updated = [...prev];
  
      if (!updated[index]) return prev; // index out of bounds
  
      const clone = { ...updated[index], tel: value };
  
      if (clone.mode !== TelNumberMode.New) {
        clone.mode = TelNumberMode.Edited;
      }
  
      updated[index] = clone;
      return updated;
    });
  };

  const handleSellerAccountChange = (
    index: number,
    field: 'bank_name' | 'seller_account' | 'bank_id',
    value: string
  ) => {
    // Update Form state
    const currentValues = form.getFieldValue('seller_accounts') || [];
    const updatedFormValues = [...currentValues];
    updatedFormValues[index] = {
      ...(updatedFormValues[index] || {}),
      [field]: value,
    };
    form.setFieldsValue({ seller_accounts: updatedFormValues });
  
    // Update your local state (e.g., to track mode)
    setSellerAccounts(prev => {
      const updated = [...prev];
      if (!updated[index]) return prev;
  
      const clone = { ...updated[index], [field]: value };
      if (clone.mode !== SellerAccountMode.New) {
        clone.mode = SellerAccountMode.Edited;
      }
      updated[index] = clone;
      return updated;
    });
  };
  
  const handleSubmit = (input: any) => {
    console.log("handleSubmit :", input, sellerAccounts);

    if (mode === 'added') {
      setLoading(true);
      onReport({ variables: { input: { ...input, mode, images } } });
    } else {
      setLoading(true);
      onReport({ variables: { input: { ...input, _id, mode, images, tel_numbers: telNumbers, seller_accounts: sellerAccounts } } });
    }
  };

  return (
          <Skeleton loading={loadingSkeleton} active paragraph={{ rows: 12 }}>
            { !loadingSkeleton &&  (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={handleValuesChange} // Track value changes
              onFinishFailed={(errorInfo) => {
                console.warn('Validation Failed:', errorInfo);
              }}
              initialValues={{}}>
              <Title level={3}>  { mode === 'edited' ? 'แก้ใข ข้อมูลรายงาน' : 'เพิ่ม รายงานใหม่' }</Title>
              {/* ชื่อคนขาย (ภาษาไทย) */}
              <Form.Item
                label="ชื่อคนขาย"
                name="seller_first_name"
                rules={[{ required: true, message: 'กรุณากรอกชื่อคนขาย' }]}
              >
                <Input placeholder="กรุณากรอกชื่อคนขาย" />
              </Form.Item>

              {/* นามสกุล(ภาษาไทย) */}
              <Form.Item
                label="นามสกุลคนขาย"
                name="seller_last_name"
                rules={[{ required: true, message: 'กรุณากรอกนามสกุลคนขาย' }]}
              >
                <Input placeholder="กรุณากรอกนามสกุลคนขาย" />
              </Form.Item>

              {/* เลขบัตรประชาชนคนขาย */}
              <Form.Item
                label="เลขบัตรประชาชนคนขาย (13 หลัก) หรือ พาสปอร์ต (passport)"
                name="id_card"
                rules={[{ required: true, message: 'กรุณากรอกเลขบัตรประชาชน หรือ พาสปอร์ต (passport)' }]}
              >
                <Input placeholder="กรุณากรอกเลขบัตรประชาชน หรือ พาสปอร์ต (passport)" maxLength={13} />
              </Form.Item>

              {/* Add Telephone Numbers */}
              <div style={{ borderColor: '#d9d9d9', padding: '10px', borderStyle: 'dashed', marginTop: '10px', marginBottom: '10px' }}>
                {telNumbers.map((number, index) => (
                  <div key={number.id} style={{ marginBottom: 20, borderColor: '#d9d9d9', padding: '10px', borderStyle: 'dashed', marginTop: '10px' }}>
                    <Form.Item
                      label={`เบอร์โทรศัพท์ หรือ ไอดีไลน์ ${index + 1}`}
                      name={['tel_numbers', index, 'tel']}
                      rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์ หรือ ไอดีไลน์' }]}
                    >
                      <Input 
                        placeholder="กรุณากรอกเบอร์โทรศัพท์ หรือ ไอดีไลน์" 
                        onChange={(e) => handleTelChange(index, e.target.value)}/>
                    </Form.Item>

                    {telNumbers.length > 1 && (
                      <Button type="dashed" onClick={() => removeTelNumber(index)}>
                        <MinusCircleOutlined /> ลบ
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add new telephone number */}
                <Form.Item>
                  <Button type="dashed" onClick={addTelNumber} >
                    <PlusOutlined /> เพิ่มเบอร์โทรศัพท์ใหม่ หรือ ไอดีไลน์
                  </Button>
                </Form.Item>
              </div>

              <div style={{ borderColor: '#d9d9d9', padding: '10px', borderStyle: 'dashed', marginTop: '10px', marginBottom: '10px' }}>
                {/* Loop through seller accounts */}
                {sellerAccounts.map((account, index) => {
                  return  <div key={account.id} style={{ marginBottom: 20, borderColor: '#d9d9d9', padding: '10px', borderStyle: 'dashed', marginTop: '10px' }}>
                            <Form.Item
                              label={`ชื่อบัญชีคนขาย ${index + 1}`}
                              name={['seller_accounts', index, 'bank_name']}
                              rules={[{ required: true, message: 'กรุณากรอกบัญชีคนขาย' }]}
                            >
                              <Input 
                                placeholder="กรุณากรอกบัญชีคนขาย" 
                                onChange={(e) => handleSellerAccountChange(index, 'bank_name', e.target.value)}/>
                            </Form.Item>

                            <Form.Item
                              label={`เลขที่บัญชีคนขาย ${index + 1}`}
                              name={['seller_accounts', index, 'seller_account']}
                              rules={[{ required: true, message: 'กรุณากรอกบัญชีคนขาย' }]}
                            >
                              <Input 
                                placeholder="กรุณากรอกบัญชีคนขาย" 
                                onChange={(e) => handleSellerAccountChange(index, 'seller_account', e.target.value)}/>
                            </Form.Item>

                            <Form.Item
                              label="เลือกธนาคาร"
                              name={['seller_accounts', index, 'bank_id']}
                              rules={[{ required: true, message: 'กรุณาเลือกธนาคาร' }]}>
                              <Select 
                                placeholder="กรุณาเลือกธนาคาร"
                                onChange={(value) => handleSellerAccountChange(index, 'bank_id', value)}>
                                {
                                  _.map(banks, (bank, index)=>{
                                    return <Option key={bank.id} value={ bank.id }>{bank.name_th}</Option>
                                  })
                                }
                              </Select>
                            </Form.Item>

                            {/* Remove button */}
                            {sellerAccounts.length > 1 && (
                              <Button type="dashed" onClick={() => removeSellerAccount(index)}>
                                <MinusCircleOutlined /> ลบ
                              </Button>
                            )}
                          </div>
                        }
                  
                )}
                {/* Add button */}
                <Form.Item>
                  <Button type="dashed" onClick={addSellerAccount} >
                    <PlusOutlined /> เพิ่มบัญชีคนขายใหม่
                  </Button>
                </Form.Item>
              </div>

              {/* สินค้าที่สั่งซื้อ */}
              <Form.Item
                label="สินค้าที่สั่งซื้อ"
                name="product"
                rules={[{ required: true, message: 'กรุณากรอกสินค้าที่สั่งซื้อ' }]}
              >
                <Input placeholder="กรุณากรอกสินค้าที่สั่งซื้อ" />
              </Form.Item>

              {/* ยอดโอน */}
              <Form.Item
                label="ยอดโอน"
                name="transfer_amount"
                rules={[{ required: true, message: 'กรุณากรอกยอดโอน' }]}
              >
                <InputNumber placeholder="กรุณากรอกยอดโอน" style={{ width: '100%' }} />
              </Form.Item>

              {/* วันโอนเงิน */}
              <Form.Item
                label="วันโอนเงิน"
                name="transfer_date"
                rules={[{ required: true, message: 'กรุณาเลือกวันโอนเงิน' }]}
              >
                <DatePicker placeholder="กรุณาเลือกวันโอนเงิน" style={{ width: '100%' }} />
              </Form.Item>

              {/* เว็บประกาศขายของ */}
              <Form.Item
                label="เว็บประกาศขายของ"
                name="selling_website"
                rules={[{ required: true, message: 'กรุณากรอกเว็บประกาศขายของ' }]}
              >
                <Input placeholder="กรุณากรอกเว็บประกาศขายของ" />
              </Form.Item>

              {/* จังหวัดของคนสร้างรายงาน */}
              <Form.Item
                label="จังหวัดของคนสร้างรายงาน"
                name="province_id"
                rules={[{ required: true, message: 'กรุณาเลือกจังหวัด' }]}>
                <Select placeholder="กรุณาเลือกจังหวัด">
                  {
                    _.map(provinces, (province, index)=>{
                      return <Option key={ index } value={ province.id }>{province.name_th}</Option>
                    })
                  }
                </Select>
              </Form.Item>

              {/* รายละเอียดเพิ่มเติม */}
              <Form.Item
                label="รายละเอียดเพิ่มเติม"
                name="additional_info"
              >
                <Input.TextArea rows={4} placeholder="กรุณากรอกรายละเอียดเพิ่มเติม" />
              </Form.Item>

              {/* ไฟล์แนบ */}
              <Form.Item
                label="ไฟล์แนบ"
                name="images"
              >
                <AttackFileField
                  label={""}
                  values={images}
                  multiple={true}
                  required={true}
                  onSnackbar={(evt)=>console.log("onSnackbar :", evt)}
                  onChange={(values) =>{
                    setImages(values)
                    const filtered = values.filter((image: any) => image?.deleted !== true );
                    form.setFieldsValue({ images: filtered });
                  }}/>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={!isFormChanged} loading={loading}>
                  { mode === 'edited' ? 'แก้ใขข้อมูล' : 'บันทึกข้อมูล' }
                </Button>
              </Form.Item>
            </Form>
            )}
          </Skeleton>
          );
};

export default ReportForm;
