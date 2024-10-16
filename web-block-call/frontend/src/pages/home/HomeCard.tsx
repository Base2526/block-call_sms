import React from 'react';
import { Card, Button, Image, Typography } from 'antd';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from "lodash"

const { Paragraph, Text } = Typography;

interface reportItem {
  current:{
      sellerFirstName: string;
      sellerLastName: string;
      idCard: string;
      sellerAccount: string;
      telNumbers: any[],
      bank: string;
      product: string;
      transferAmount: number;
      transferDate: string; // ISO string
      sellingWebsite: string;
      province: string; // Province ID
      additionalInfo?: string;
      images: any[]; // URLs or file paths
  }
  updatedAt: string;
}

// Define a TypeScript interface for card props
interface ProductCardProps {
  report: reportItem;
  onClick?: () => void;
  onAddToCart?: () => void;
  onDeleteForCart?: () => void;
  onBuy?: () => void;
}

const { REACT_APP_HOST_GRAPHAL } = process.env;
const HomeCard: React.FC<ProductCardProps> = ({
  report,
  onClick,
  onAddToCart,
  onDeleteForCart,
  onBuy
}) => {  
  const items = _.map(report.current.images, v=> `http://${REACT_APP_HOST_GRAPHAL}/${v.url}`);

  const telNumbersView = () =>{
    return  <>{_.map(report.current.telNumbers, (v)=><Paragraph copyable style={{ display: 'inline', margin: 0 }}>{ v.tel }</Paragraph>) }</>
  }

  return (
    <Card
      hoverable
      cover={ 
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <Image.PreviewGroup items={items}>
            <Image
              style={{
                objectFit: 'cover',
                height: '200px',
                minWidth: '150px',
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
              }}
              width="100%"
              src={`${items[0]}`} // Display the first image
            />
          </Image.PreviewGroup>
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              backgroundColor: 'gray',
              color: 'white',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '12px',
            }}
          >
            {items.length} {/* Display the number of images */}
          </div>
        </div>
      }>
      <div style={{ marginTop: '5px', minWidth: '150px' }}>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", display: 'inline' }} >
          <Text>ชื่อ:</Text>{" "} 
          <Paragraph copyable style={{ display: 'inline', margin: 0 }}>
            {report.current.sellerFirstName} {report.current.sellerLastName}
          </Paragraph>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}><Text>สินค้า: { report.current.product}</Text></p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)", display: 'inline' }}>
          <Text>เบอร์/ไลน์:</Text>{" "} { telNumbersView()}</p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}>
          <Text>เว็บไซต์:</Text>{" "}
          <a href={report.current.sellingWebsite} target="_blank" rel="noopener noreferrer"><Text>{ report.current.sellingWebsite}</Text></a>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}><Text>ยอดเงิน: {new Intl.NumberFormat('th-TH').format(report.current.transferAmount)}</Text></p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}><Text>วันลงข้อมูล: { moment(report.updatedAt).format('MM/DD, YY hh:mm') }</Text></p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', // Align buttons to the end of the flex container
          gap: '8px' // Space between buttons
        }}>
          <Button className='ant-btn-like' type="primary" icon={<LikeOutlined />} onClick={onBuy} />
          <Button className='ant-btn-dislike' type="primary"  style={{backgroundColor:'red'}} icon={<DislikeOutlined />} onClick={onBuy} />
        </div>
      </div>
    </Card>
  );
};

export default HomeCard;