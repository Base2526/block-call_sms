import React, { useState, useEffect } from 'react';
import { Descriptions, Image, Carousel, Row, Col, Skeleton } from 'antd';
import { useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { guery_report, guery_provinces, mutation_report } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';

interface FormData {
    sellerFirstName: string;
    sellerLastName: string;
    idCard: string;
    sellerAccount: string;
    bank: string;
    product: string;
    transferAmount: number;
    transferDate: string; // ISO string
    sellingWebsite: string;
    province: string; // Province ID
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
  const { _id } = location.state || {};

  const [data, setData] = useState<FormData>();

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
    if (!loadingReport && dataReport?.report) {
      if (dataReport.report.status) {
        let report = dataReport.report.data;
        setData({
          sellerFirstName: report.current.sellerFirstName,
          sellerLastName: report.current.sellerLastName,
          idCard: report.current.idCard,
          sellerAccount: report.current.sellerAccount,
          bank: report.current.bank,
          product: report.current.product,
          transferAmount: report.current.transferAmount,
          transferDate: report.current.transferDate ,
          sellingWebsite: report.current.sellingWebsite,
          province: report.province.name_th, // Province ID
          additionalInfo: report.current.additionalInfo,
          images: report.current.images
        });
      }
    }
  }, [dataReport, loadingReport]);

  useEffect(() => {
    _id && refetchReport({ id: _id });
  }, [_id, refetchReport]);

  return (
      <Skeleton loading={loadingReport} active>
        {
          data && <Row gutter={[16, 16]} style={{ margin: '20px' }}>
          {/* Left Column: Images */}
          <Col xs={24} md={10}>
            {data.images && data.images.length > 0 ? (
              <Carousel arrows infinite={false} style={{ textAlign: 'center' }}>
                {data.images.map((image, index) => {
                  console.log("@@1 :", image)
                  return  <div className='xxxxxx-uu' key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                            <Image
                              src={`http://localhost:1984/${ image.url }`}
                              alt={`Image ${index + 1}`}
                              style={{ maxHeight: '400px', objectFit: 'contain' }}
                            />
                          </div>  
                })}
              </Carousel>
            ) : (
              <p>ไม่มีรูปภาพแนบ</p>
            )}
          </Col>

          {/* Right Column: Details */}
          <Col xs={24} md={14}>
            <Descriptions
              title="รายละเอียดการขาย"
              bordered
              layout="horizontal"
              column={1}
            >
              <Descriptions.Item label="ชื่อคนขาย (ภาษาไทย)">{data.sellerFirstName}</Descriptions.Item>
              <Descriptions.Item label="นามสกุล (ภาษาไทย)">{data.sellerLastName}</Descriptions.Item>
              <Descriptions.Item label="เลขบัตรประชาชนคนขาย">{data.idCard}</Descriptions.Item>
              <Descriptions.Item label="บัญชีคนขาย">{data.sellerAccount}</Descriptions.Item>
              <Descriptions.Item label="เลือกธนาคาร">{bankOptions[data.bank] || 'ไม่ระบุ'}</Descriptions.Item>
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
              <Descriptions.Item label="จังหวัดของคนสร้างรายงาน">{data.province}</Descriptions.Item>
              {data.additionalInfo && (
                <Descriptions.Item label="รายละเอียดเพิ่มเติม">{data.additionalInfo}</Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
        }
      </Skeleton>
  );
};

export default ReportView;