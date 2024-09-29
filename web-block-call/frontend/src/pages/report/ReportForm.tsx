import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber } from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import _ from "lodash";
import moment from 'moment';
import { useLocation } from 'react-router-dom';

import AttackFileField from "@/components/basic/attack-file";
import { guery_report, guery_provinces, mutation_report } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';

interface ProvinceItem {
  _id: string;
  name_th: string;
  name_en: string;
}

const { Option } = Select;
const ReportForm: React.FC = (props) => {
  const location = useLocation();

  const { mode, _id } = location.state || {};

  const [form] = Form.useForm();
  const [images, setImages] = useState<File[]>([]);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [loading, setLoading] = useState(false); 

  const [onReport] = useMutation(mutation_report, {
    context: { headers: getHeaders(location) },
    update: (cache, { data: { report } }) => {
      console.log("report: ", report);
    },
    onCompleted: (data) => {
      setLoading(false);  // Set loading to false when mutation completes
      // navigate(-1);
    },
    onError: (error) => {
      setLoading(false);  // Set loading to false when an error occurs
      // console.log("product onError:", error);
      handlerError(props, error);
    }
  });

  const { loading: loadingProvinces, 
          data: dataProvinces, 
          error: errorProvinces, 
          refetch: refetchProvinces } = useQuery(guery_provinces, {
    context: { headers: getHeaders(location) },
    fetchPolicy: 'no-cache',
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

      console.log("ReportForm @@0 :", dataReport)
      if (!loadingReport && dataReport?.report) {

        console.log("ReportForm @@1 :", dataReport)
        if (dataReport.report.status) {
          let report = dataReport.report.data;

          console.log("ReportForm  @@2 :", report)
          form.setFieldsValue({
            sellerFirstName: report.current.sellerFirstName,
            sellerLastName: report.current.sellerLastName,
            idCard: report.current.idCard,
            sellerAccount: report.current.sellerAccount,
            bank: report.current.bank,
            product: report.current.product,
            transferAmount: report.current.transferAmount,
            transferDate: moment(report.current.transferDate) ,
            sellingWebsite: report.current.sellingWebsite,
            provinceId: report.current.provinceId, // Province ID
            additionalInfo: report.current.additionalInfo,
            // images: string[]; // URLs or file paths
          });

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

  useEffect(()=>{
    console.log("provinces :", provinces)
  }, [provinces])

  const handleSubmit = (input: any) => {
    console.log('Form values:', input);

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
      initialValues={{ 
        // province: 'กรุงเทพมหานคร' 
      }}
    >
      {/* ชื่อคนขาย (ภาษาไทย) */}
      <Form.Item
        label="ชื่อคนขาย (ภาษาไทย)"
        name="sellerFirstName"
        rules={[{ required: true, message: 'กรุณากรอกชื่อคนขาย' }]}
      >
        <Input placeholder="กรุณากรอกชื่อคนขาย" />
      </Form.Item>

      {/* นามสกุล(ภาษาไทย) */}
      <Form.Item
        label="นามสกุล (ภาษาไทย)"
        name="sellerLastName"
        rules={[{ required: true, message: 'กรุณากรอกนามสกุลคนขาย' }]}
      >
        <Input placeholder="กรุณากรอกนามสกุลคนขาย" />
      </Form.Item>

      {/* เลขบัตรประชาชนคนขาย */}
      <Form.Item
        label="เลขบัตรประชาชนคนขาย"
        name="idCard"
        rules={[{ required: true, message: 'กรุณากรอกเลขบัตรประชาชน' }]}
      >
        <Input placeholder="กรุณากรอกเลขบัตรประชาชน" maxLength={13} />
      </Form.Item>

      {/* บัญชีคนขาย */}
      <Form.Item
        label="บัญชีคนขาย"
        name="sellerAccount"
        rules={[{ required: true, message: 'กรุณากรอกบัญชีคนขาย' }]}
      >
        <Input placeholder="กรุณากรอกบัญชีคนขาย" />
      </Form.Item>

      {/* เลือกธนาคาร */}
      <Form.Item
        label="เลือกธนาคาร"
        name="bank"
        rules={[{ required: true, message: 'กรุณาเลือกธนาคาร' }]}
      >
        <Select placeholder="กรุณาเลือกธนาคาร">
          <Option key="1" value="scb">ไทยพาณิชย์ (SCB)</Option>
          <Option key="2" value="kbank">กสิกรไทย (KBank)</Option>
          <Option key="3" value="bbl">กรุงเทพ (BBL)</Option>
        </Select>
      </Form.Item>

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
        {/* <Upload>
          <Button icon={<UploadOutlined />}>อัพโหลดไฟล์</Button>
        </Upload> */}
         <AttackFileField
          label={""}
          values={images}
          multiple={true}
          required={true}
          onSnackbar={(evt)=>console.log("onSnackbar :", evt)}
          onChange={(values) => setImages(values)}/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          { mode === 'edited' ? 'แก้ใขข้อมูล' : 'ส่งข้อมูล' }
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReportForm;
