import React, { useEffect } from 'react';
import { List, Button, Image, Typography, Empty } from 'antd';
import { BookOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { reportItem } from '@/utils/Interface';

const { Text, Paragraph } = Typography;

interface CustomEmptyProps {}

const CustomEmpty: React.FC<CustomEmptyProps> = ({}) => {
  return (
    <Empty
    image="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
    imageStyle={{ height: 100 }}
    description={<span>No items found</span>}
    />
  );
};

export default CustomEmpty;
