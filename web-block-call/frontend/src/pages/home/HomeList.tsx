import React, { useEffect } from 'react';
import { List, Button, Image, Typography, Dropdown, Menu } from 'antd';
import { LikeOutlined, DislikeOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { reportItem } from '@/utils/Interface';
import HomeDropdown from "@/pages/home/HomeDropdown"
import HomeActions from "@/pages/home/HomeActions";

const { Paragraph, Text } = Typography;

interface HomeListProps {
  report: reportItem;
  onClick?: () => void;
  onDropdownItemClick: (id: string | number, action: string | number) => void;
  onActionItemClick: (id: string | number, action: string | number) => void;
}
const { REACT_APP_HOST_GRAPHAL } = process.env;

const HomeList: React.FC<HomeListProps> = ({ report, onClick, onDropdownItemClick, onActionItemClick }) => {

  const items = _.map(report.images, v => `http://${REACT_APP_HOST_GRAPHAL}/${v.url}`);
  const telNumbersView = () => (
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
    <List.Item className="list-card-item" style={{ position: 'relative' }}>
      <HomeDropdown item={report} onItemClick={onDropdownItemClick}/>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image.PreviewGroup items={items}>
            <Image
              width={150}
              height={150}
              style={{ objectFit: 'cover', borderRadius: 5 }}
              src={items[0]}/>
          </Image.PreviewGroup>
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              color: 'white',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '12px',
              // rgba(0,0,0,0.04)
            }}>
            {items.length} {/* Display the number of images */}
          </div>
        </div>

        {/* Actions Below Image */}
        {/* <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button
            className="ant-btn-like"
            type="primary"
            icon={<LikeOutlined />}
            onClick={()=>{}}
          />
          <Button
            className="ant-btn-dislike"
            type="primary"
            style={{ backgroundColor: 'red' }}
            icon={<DislikeOutlined />}
            onClick={()=>{}}
          />
        </div> */}

        <HomeActions 
          item={report} 
          onActionItemClick={(id, action)=>{ 
            console.log("[List] : ActionItemClick >>", id, action) 
            onActionItemClick(id, action);
          }} 
          style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', width: '100%' }} />
      </div>

      {/* Details */}
      <div style={{ marginLeft: '15px', flex: 1 }}>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", marginBottom: 5 }}>
          <Text strong>ชื่อ:</Text>{" "} 
          <Paragraph copyable style={{ display: 'inline', margin: 0 }}>
            {report.seller_first_name} {report.seller_last_name}
          </Paragraph>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", marginBottom: 5 }}>
          <Text strong>สินค้า:</Text>{" "} 
          <Paragraph style={{ display: 'inline', margin: 0 }}>
            {report.product}
          </Paragraph>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", marginBottom: 5 }}>
          <Text strong>เบอร์/ไลน์:</Text> {telNumbersView()}
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", marginBottom: 5 }}>
          <Text strong>เว็บไซต์:</Text>{" "}
          <a href={report.selling_website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            {report.selling_website}
          </a>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)", marginBottom: 5 }}>
          <Text strong>ยอดเงิน:</Text>{" "}
          <Paragraph style={{ display: 'inline', margin: 0 }}>{new Intl.NumberFormat('th-TH').format(report.transfer_amount)}</Paragraph>
        </p>
        <p onClick={onClick} style={{ fontSize: '12px', color: "rgba(0, 0, 0, 0.45)" }}>
          <Text strong>วันลงข้อมูล:</Text>{" "}
          <Paragraph style={{ display: 'inline', margin: 0 }}>{moment(report.updated_at).format('MM/DD, YY hh:mm')}</Paragraph>
        </p>
      </div>      
    </List.Item>
  );
};

export default HomeList;
