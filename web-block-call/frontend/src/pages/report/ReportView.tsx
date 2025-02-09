import React, { useState, useEffect } from 'react';
import { Layout, Descriptions, Image, Carousel, Row, Col, Skeleton, Tag, Typography } from 'antd';
import { useQuery } from '@apollo/client';
import { useLocation, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import _ from "lodash"

import Comments from "@/pages/components/Comments"
import { query_report } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';
import HomeDropdown from "@/pages/home/HomeDropdown"

const { Paragraph } = Typography;
interface FormData {
    sellerFirstName: string;
    sellerLastName: string;
    idCard: string;
    telNumbers: any[];
    sellerAccounts: any[];
    bank: string;
    product: string;
    transferAmount: number;
    transferDate: string; // ISO string
    sellingWebsite: string;
    province: any; // Province ID
    additionalInfo?: string;
    images: any[]; // URLs or file paths
}

const bankOptions: { [key: string]: string } = {
  scb: 'ไทยพาณิชย์ (SCB)',
  kbank: 'กสิกรไทย (KBank)',
  bbl: 'กรุงเทพ (BBL)',
};

const ReportView: React.FC = (props) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { _id } = location.state || { _id: searchParams.get('v') };

  console.log("ReportView :", _id)
  const [data, setData] = useState<FormData>();

  const { loading: loadingReport, 
    data: dataReport, 
    error: errorReport,
    refetch: refetchReport } = useQuery(query_report, {
        context: { headers: getHeaders(location) },
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: false,
        skip: !_.isEmpty(_id) 
    });

  if (errorReport) {
    handlerError(props, errorReport);
  }

  useEffect(() => {
    if (!loadingReport && dataReport?.report) {
      if (dataReport.report.status) {
        let report = dataReport.report.data;
        console.log("ReportView @@@: ", report)
        setData({
          sellerFirstName: report.seller_first_name,
          sellerLastName: report.seller_last_name,
          idCard: report.id_card,
          telNumbers: report.tel_numbers,
          sellerAccounts: report.seller_accounts,
          bank: report.bank,
          product: report.product,
          transferAmount: report.transfer_amount,
          transferDate: report.transfer_date ,
          sellingWebsite: report.selling_website,
          province: report.province.length > 0 ? report.province[0] : "", // Province ID
          additionalInfo: report.additional_info,
          images: report.images
        });
      }
    }
  }, [dataReport, loadingReport]);

  useEffect(() => {
    _id && refetchReport({ id: _id });
  }, [_id, refetchReport]);

  const sellerTelView = () => (
    !data  ? <></> : <ul style={{ paddingLeft: 12 }}>{_.map(data.telNumbers, (v, index)=><li key={index}><Paragraph copyable>{ v.tel }</Paragraph></li>) }</ul>
  );

  const sellerAccountsView = () =>{
    return !data  ? <></> : <ul style={{ paddingLeft: 12 }}>{_.map(data.sellerAccounts, (v, index)=> 
                                                                  <li key={index}>
                                                                    <Paragraph copyable style={{ display: 'inline', marginRight: 8, fontWeight: 'bold' }}>
                                                                      {v.seller_account}
                                                                    </Paragraph>
                                                                    <span>
                                                                      / {v.bank_name}   
                                                                    </span>
                                                                  </li> ) }
                              </ul>
  }

  return (
      <Skeleton loading={loadingReport} active>
        {
          data && <Row gutter={[16, 16]} style={{ margin: '20px', width: "100%" }}>
          {/* Left Column: Images */}
          <Col xs={24} md={14} style={{ /*marginRight: '8px'*/  }}>
            
            {data?.images && data?.images.length > 0 ? (
              <Carousel arrows infinite={false} style={{ textAlign: 'center', borderRadius: '10px', borderStyle:'dashed', borderColor:'#ebebeb', }}>
                {data.images.map((image, index) => {
                  console.log("@@1 :", image)
                  return  <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                            <Image
                              src={`http://localhost:4000/${ image.url }`}
                              alt={`Image ${index + 1}`}
                              // style={{ maxHeight: '400px', objectFit: 'contain' }}

                              style={{
                                minHeight: '200px', // Set minimum height
                                minWidth: '300px',  // Set minimum width
                                maxHeight: '400px',
                                maxWidth: '100%', // Ensure it doesn't overflow the column
                                objectFit: 'contain' // Preserve aspect ratio
                              }}
                            />
                          </div>  
                })}
              </Carousel>
            ) : (
              <p>ไม่มีรูปภาพแนบ</p>
            )}
            <HomeDropdown style={{ top: 10, right: 20 }}  id={3} onItemClick={(id, key)=> console.log(">>: ", id, key)}/>
            <Descriptions
              title="รายละเอียดการขาย"
              bordered
              layout="horizontal"
              column={1}>
              <Descriptions.Item label="ชื่อ-นามสกุล คนขาย"><Paragraph copyable>{data.sellerFirstName} {data.sellerLastName}</Paragraph></Descriptions.Item>
              <Descriptions.Item label="เลขบัตรประชาชน/พาสปอร์ต คนขาย"><Paragraph copyable>{data.idCard}</Paragraph></Descriptions.Item>
              <Descriptions.Item label="เบอร์โทรศัพท์/ไอดีไลน์">{sellerTelView()}</Descriptions.Item>
              <Descriptions.Item label="บัญชีคนขาย">{sellerAccountsView()}</Descriptions.Item>
              <Descriptions.Item label="สินค้าที่สั่งซื้อ">{data.product}</Descriptions.Item>
              <Descriptions.Item label="ยอดโอน">
                {data.transferAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
              </Descriptions.Item>
              <Descriptions.Item label="วันโอนเงิน">{data.transferDate}</Descriptions.Item>
              <Descriptions.Item label="เว็บประกาศขายของ">
                <a href={data.sellingWebsite} target="_blank" rel="noopener noreferrer">
                  {data.sellingWebsite}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="จังหวัด">{data.province?.name_th}</Descriptions.Item>
              {data.additionalInfo && (
                <Descriptions.Item label="รายละเอียดเพิ่มเติม">{data.additionalInfo}</Descriptions.Item>
              )}
            </Descriptions>
          </Col>

          {/* Right Column: Details */}
          <Col xs={24} md={9} className='right-column' style={{ padding: '5px', borderRadius: '10px', borderStyle:'dashed', borderColor:'#ebebeb', width: '100%' }}>
            <div style={{ width: '100%', padding: '10px' }}>
              <Comments id={_id} />
            </div>
          </Col>
        </Row>
        }
      </Skeleton>
  );
};

export default ReportView;