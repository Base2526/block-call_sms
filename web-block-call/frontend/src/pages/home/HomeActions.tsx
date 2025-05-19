import React, { useEffect } from 'react';
import { List, Button, Image, Typography, Dropdown, Menu } from 'antd';
import { BookOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { reportItem } from '@/utils/Interface';

const { Text, Paragraph } = Typography;

interface HomeActionsProps {
    item: reportItem; 
    onActionItemClick: (id: string | number, action: string) => void;  // Handles menu clicks
    style: React.CSSProperties;  // Add style prop
}

const HomeActions: React.FC<HomeActionsProps> = ({ item, onActionItemClick, style }) => {
  return (
    <div style={{ gap: 10, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* <Paragraph style={{ margin: 0 }}>{10}</Paragraph> */}
            <Button
                className="ant-btn-bookmark"
                type="primary"
                color="default" 
                variant="filled"
                style={{
                    width: 25,
                    height: 25,
                    padding: 0,
                    fontSize: 16,
                }}
                icon={<BookOutlined />}
                onClick={()=>onActionItemClick(item.report_id, "bookmark")}
            />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Paragraph style={{ margin: 0 }}>{10}</Paragraph>
            <Button
                className="ant-btn-comment"
                type="primary"
                color="default" 
                variant="filled"
                style={{
                    width: 25,
                    height: 25,
                    padding: 0,
                    fontSize: 16,
                }}
                icon={<CommentOutlined />}
                onClick={()=>{onActionItemClick(item.report_id, "comment")}}
            />
        </div>
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Paragraph style={{ margin: 0 }}>{10}</Paragraph>
            <Button
                className="ant-btn-share"
                type="primary"
                color="default" 
                variant="filled"
                style={{
                    width: 25,
                    height: 25,
                    padding: 0,
                    fontSize: 16,
                }}
                icon={<ShareAltOutlined />}
                onClick={()=>{onActionItemClick}}
            />
        </div> */}
    </div>
  );
};

export default HomeActions;
