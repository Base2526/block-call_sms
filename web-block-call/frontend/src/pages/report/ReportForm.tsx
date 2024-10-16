import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Typography } from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import _ from "lodash";
import moment from 'moment';
import { useLocation, useNavigate } from "react-router-dom";
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import AttackFileField from "@/components/basic/attack-file";
import { guery_report, guery_provinces, mutation_report, query_banks } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';

const { Title } = Typography;

interface ProvinceItem {
  _id: string;
  name_th: string;
  name_en: string;
}

interface BankItem{
  _id: string;
  name_th: string;
  name_en: string;
  description: string;
}

interface SellerAccountsItem{
  _id: string;
  bankId: string;
  sellerAccount: string;
}

const { Option } = Select;
const ReportForm: React.FC = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, _id } = location.state || {};

  const [form] = Form.useForm();
  const [images, setImages] = useState<File[]>([]);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(false); 
  const [sellerAccounts, setSellerAccounts] = useState([{ _id: 0, bankId: "", sellerAccount: "" }]);
  const [telNumbers, setTelNumbers] = useState([{ _id: 0, tel: '' }]); // Dynamic telephone numbers

  const [initialValues, setInitialValues] = useState<any>(null); // To track initial form values
  const [isFormChanged, setIsFormChanged] = useState(false); // To track if the form has changed


  const addSellerAccount = () => {
    setSellerAccounts([...sellerAccounts, { _id: sellerAccounts.length,  bankId: "", sellerAccount: "" }]);
  };

  const removeSellerAccount = (index: number) => {
    const newAccounts = sellerAccounts.filter((_, idx) => idx !== index);
    setSellerAccounts(newAccounts);
  };

  // Add new telephone field
  const addTelNumber = () => {
    setTelNumbers([...telNumbers, { _id: telNumbers.length, tel: '' }]);
  };

  // Remove telephone field
  const removeTelNumber = (index: number) => {
    const newTels = telNumbers.filter((_, idx) => idx !== index);
    setTelNumbers(newTels);
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
          error: errorProvinces } = useQuery(guery_provinces, {
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
    refetch: refetchReport } = useQuery(guery_report, {
        context: { headers: getHeaders(location) },
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: false,
    });

  if (errorReport) {
    handlerError(props, errorReport);
  }

  useEffect(() => {
    if (mode === 'edited') {
      if (!loadingReport && dataReport?.report) {
        if (dataReport.report.status) {
          let report = dataReport.report.data;

          console.log("ReportForm  @@1 :", report);
          const initialData = {
            sellerFirstName: report.current.sellerFirstName,
            sellerLastName: report.current.sellerLastName,
            idCard: report.current.idCard,
            telNumbers: report.current.telNumbers,
            sellerAccounts: report.current.sellerAccounts,
            product: report.current.product,
            transferAmount: report.current.transferAmount,
            transferDate: moment(report.current.transferDate),
            sellingWebsite: report.current.sellingWebsite,
            provinceId: report.current.provinceId,
            additionalInfo: report.current.additionalInfo,
          };

          form.setFieldsValue(initialData);
          setInitialValues(initialData); // Set initial values
          setSellerAccounts(report.current.sellerAccounts);
          setTelNumbers(report.current.telNumbers);
          setImages(report.current.images);
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
  //   console.log("form @@@ :", form)
  // }, [form])

  // Handle form value changes
  const handleValuesChange = (changedValues: any) => {
    const currentValues = form.getFieldsValue();
    console.log("handleValuesChange :", currentValues, initialValues)

    setIsFormChanged(!_.isEqual(currentValues, initialValues));
  };

  const handleSubmit = (input: any) => {

    console.log("handleSubmit :", input)

    if (mode === 'added') {
      setLoading(true);
      onReport({ variables: { input: { ...input, mode, images } } });
    } else {
      setLoading(true);
      onReport({ variables: { input: { ...input, _id, mode, images } } });
    }
  };

  return (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={handleValuesChange} // Track value changes
              initialValues={{}}>
              <Title level={3}>  { mode === 'edited' ? 'แก้ใข ข้อมูลรายงาน' : 'เพิ่ม รายงานใหม่' }</Title>
              {/* ชื่อคนขาย (ภาษาไทย) */}
              <Form.Item
                label="ชื่อคนขาย"
                name="sellerFirstName"
                rules={[{ required: true, message: 'กรุณากรอกชื่อคนขาย' }]}
              >
                <Input placeholder="กรุณากรอกชื่อคนขาย" />
              </Form.Item>

              {/* นามสกุล(ภาษาไทย) */}
              <Form.Item
                label="นามสกุลคนขาย"
                name="sellerLastName"
                rules={[{ required: true, message: 'กรุณากรอกนามสกุลคนขาย' }]}
              >
                <Input placeholder="กรุณากรอกนามสกุลคนขาย" />
              </Form.Item>

              {/* เลขบัตรประชาชนคนขาย */}
              <Form.Item
                label="เลขบัตรประชาชนคนขาย (13 หลัก) หรือ พาสปอร์ต (passport)"
                name="idCard"
                rules={[{ required: true, message: 'กรุณากรอกเลขบัตรประชาชน หรือ พาสปอร์ต (passport)' }]}
              >
                <Input placeholder="กรุณากรอกเลขบัตรประชาชน หรือ พาสปอร์ต (passport)" maxLength={13} />
              </Form.Item>

              {/* Add Telephone Numbers */}
              <div style={{ borderColor: '#d9d9d9', padding: '10px', borderStyle: 'dashed', marginTop: '10px', marginBottom: '10px' }}>
                {telNumbers.map((tel, index) => (
                  <div key={tel._id} style={{ marginBottom: 20 }}>
                    <Form.Item
                      label={`เบอร์โทรศัพท์ หรือ ไอดีไลน์ ${index + 1}`}
                      name={['telNumbers', index, 'tel']}
                      rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์ หรือ ไอดีไลน์' }]}
                    >
                      <Input placeholder="กรุณากรอกเบอร์โทรศัพท์ หรือ ไอดีไลน์" />
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
                  return  <div key={account._id} style={{ marginBottom: 20 }}>
                            <Form.Item
                              label={`บัญชีคนขาย ${index + 1}`}
                              name={['sellerAccounts', index, 'sellerAccount']}
                              rules={[{ required: true, message: 'กรุณากรอกบัญชีคนขาย' }]}
                            >
                              <Input placeholder="กรุณากรอกบัญชีคนขาย" />
                            </Form.Item>

                            <Form.Item
                              label="เลือกธนาคาร"
                              name={['sellerAccounts', index, 'bankId']}
                              rules={[{ required: true, message: 'กรุณาเลือกธนาคาร' }]}>
                              <Select placeholder="กรุณาเลือกธนาคาร">
                                {
                                  _.map(banks, (bank, index)=>{
                                    return <Option key={ index } value={ bank._id }>{bank.name_th}</Option>
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
                name="transferAmount"
                rules={[{ required: true, message: 'กรุณากรอกยอดโอน' }]}
              >
                <InputNumber placeholder="กรุณากรอกยอดโอน" style={{ width: '100%' }} />
              </Form.Item>

              {/* วันโอนเงิน */}
              <Form.Item
                label="วันโอนเงิน"
                name="transferDate"
                rules={[{ required: true, message: 'กรุณาเลือกวันโอนเงิน' }]}
              >
                <DatePicker placeholder="กรุณาเลือกวันโอนเงิน" style={{ width: '100%' }} />
              </Form.Item>

              {/* เว็บประกาศขายของ */}
              <Form.Item
                label="เว็บประกาศขายของ"
                name="sellingWebsite"
                rules={[{ required: true, message: 'กรุณากรอกเว็บประกาศขายของ' }]}
              >
                <Input placeholder="กรุณากรอกเว็บประกาศขายของ" />
              </Form.Item>

              {/* จังหวัดของคนสร้างรายงาน */}
              <Form.Item
                label="จังหวัดของคนสร้างรายงาน"
                name="provinceId"
                rules={[{ required: true, message: 'กรุณาเลือกจังหวัด' }]}>
                <Select placeholder="กรุณาเลือกจังหวัด">
                  {
                    _.map(provinces, (province, index)=>{
                      return <Option key={ index } value={ province._id }>{province.name_th}</Option>
                    })
                  }
                </Select>
              </Form.Item>

              {/* รายละเอียดเพิ่มเติม */}
              <Form.Item
                label="รายละเอียดเพิ่มเติม"
                name="additionalInfo"
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
                  onChange={(values) => setImages(values)}/>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={!isFormChanged} loading={loading}>
                  { mode === 'edited' ? 'แก้ใขข้อมูล' : 'ส่งข้อมูล' }
                </Button>
              </Form.Item>
            </Form>
          );
};

export default ReportForm;
