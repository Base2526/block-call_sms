import React, { useEffect } from 'react';
import { List, Button, Image, Typography, Dropdown, Menu } from 'antd';
import { BookOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { reportItem } from '@/utils/Interface';

const { Text, Paragraph } = Typography;

interface HomeActionsProps {
    current_user: any;
    item: reportItem; 
    onActionItemClick: (id: string | number, action: string) => void;  // Handles menu clicks
    style: React.CSSProperties;  // Add style prop
}

const HomeActions: React.FC<HomeActionsProps> = ({ current_user, item, onActionItemClick, style }) => {
  return (
    <div style={{ gap: 10, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* <Paragraph style={{ margin: 0 }}>{10}</Paragraph> */}

            {/* const hasUserId1 = ; */}

            {/* danger */}
            <Button
                className="ant-btn-bookmark"
                type="primary"
                color={ item.bookmarks.some(item => item.user_id === current_user.id) ? "danger" : "default" }
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
            <Paragraph style={{ margin: 0 }}>{parseInt(item.total_comments, 10) === 0 ? "" : item.total_comments }</Paragraph>
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
