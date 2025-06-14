import React, { useEffect } from 'react';
import { List, Button, Image, Typography, Dropdown, Menu } from 'antd';
import { LikeOutlined, DislikeOutlined, MoreOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useSelector } from 'react-redux';

import { reportItem } from '@/utils/Interface';
import  { DefaultRootState } from '@/interface/DefaultRootState';

interface HomeDropdownProps {
    item: reportItem; 
    onItemClick: (id: string | number, action: string) => void;  // Handles menu clicks
    style?: React.CSSProperties;  // Add style prop
}

const HomeDropdown: React.FC<HomeDropdownProps> = ({ item, onItemClick, style }) => {
  const { logged, device, profile } = useSelector((state: DefaultRootState) => state.user);

  const items = [
    { label: 'Owner post', key: '1' },
    { label: 'Edit', key: '2' },
    { label: 'Delete', key: '3' },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    onItemClick(item.report_id, key);
  };

  return (
    logged && profile.id == item.user_id
      ? <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']}>
          <Button
            icon={<MoreOutlined />}
            type="text"
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              fontSize: '20px',
              ...style,
            }}
          />
        </Dropdown>
      : <></>
  );
};

export default HomeDropdown;
