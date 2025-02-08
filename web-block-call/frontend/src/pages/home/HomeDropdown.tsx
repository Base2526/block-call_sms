import React from 'react';
import { List, Button, Image, Typography, Dropdown, Menu } from 'antd';
import { LikeOutlined, DislikeOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { reportItem } from '@/utils/Interface';

const { Paragraph, Text } = Typography;

interface HomeDropdownProps {
    id: string | number;  // Accepts an id as prop
    onItemClick: (id: string | number, action: string) => void;  // Handles menu clicks
    style?: React.CSSProperties;  // Add style prop
}

const HomeDropdown: React.FC<HomeDropdownProps> = ({ id, onItemClick, style }) => {
  const menu = (
    <Menu onClick={({ key }) => onItemClick(id, key)}>
        <Menu.Item key="1">Owner post</Menu.Item>
        <Menu.Item key="2">Edit</Menu.Item>
        <Menu.Item key="3">Delete</Menu.Item>
    </Menu>
  );
  return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button
          icon={<MoreOutlined />}
          type="text"
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            fontSize: '20px',
            ...style,  // Merge custom styles
          }}
          onClick={(e) => {
            e.stopPropagation();  // Prevent List.Item click
            console.log("Clicked ID:", id);
          }} // Prevent List.Item click when clicking menu
        />
      </Dropdown>
  );
};

export default HomeDropdown;
