import React from 'react';
import { Card, Button, Image, Typography, Dropdown, Menu } from 'antd';
import { LikeOutlined, DislikeOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from "lodash"
import { reportItem } from "@/utils/Interface" 

import HomeDropdown from "@/pages/home/HomeDropdown"

const { Paragraph, Text } = Typography;

// Define a TypeScript interface for card props
interface HomeGridProps {
  report: reportItem;
  onClick?: () => void;
  onMenuItemClick: (id: string | number, action: string) => void;
}

const { REACT_APP_HOST_GRAPHAL } = process.env;
const HomeGrid: React.FC<HomeGridProps> = ({ report, onClick, onMenuItemClick }) => { 
   
  const items = _.map(report.images, v=> `http://${REACT_APP_HOST_GRAPHAL}/${v.url}`);
  const telNumbersView = () =>(
    <ul style={{marginLeft: '0px'}}>
      {_.map(report.tel_numbers, (v, index) => (
        <li key={index} >
          <Paragraph copyable style={{ display: 'inline', margin: 0 }}>
            {v.tel}
          </Paragraph>
        </li>
      ))}
    </ul>
  );

  return (
    <Card
      className="grid-card-item"
      hoverable
      cover={ 
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <Image.PreviewGroup items={items}>
            <Image
              style={{
                objectFit: 'cover',
                height: '170px',
                minWidth: '100px',
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
      <HomeDropdown id={report.report_id} onItemClick={onMenuItemClick}/>
      <div style={{ marginTop: '5px', minWidth: '150px' }}>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", display: 'inline' }} >
          <Text>ชื่อ:</Text>{" "} 
          <Paragraph copyable style={{ display: 'inline', margin: 0 }}>
            {report.seller_first_name} {report.seller_last_name}
          </Paragraph>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}><Text>สินค้า: { report.product}</Text></p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)", display: 'inline' }}>
          <Text>เบอร์/ไลน์:</Text>{" "} { telNumbersView()}</p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}>
          <Text>เว็บไซต์:</Text>{" "}
          <a href={report.selling_website} target="_blank" rel="noopener noreferrer"><Text>{ report.selling_website}</Text></a>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}><Text>ยอดเงิน: {new Intl.NumberFormat('th-TH').format(report.transfer_amount)}</Text></p>
        <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}><Text>วันลงข้อมูล: { moment(report.updated_at).format('MM/DD, YY hh:mm') }</Text></p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', // Align buttons to the end of the flex container
          gap: '8px' // Space between buttons
        }}>
          <Button className='ant-btn-like' type="primary" icon={<LikeOutlined />} onClick={()=>{}} />
          <Button className='ant-btn-dislike' type="primary"  style={{backgroundColor:'red'}} icon={<DislikeOutlined />} onClick={()=>{}} />
        </div>
      </div>
    </Card>
  );
};

export default HomeGrid;