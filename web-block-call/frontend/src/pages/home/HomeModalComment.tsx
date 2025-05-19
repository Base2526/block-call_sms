import React, { useEffect, useState } from 'react';
import { AutoComplete, Input, Button, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Search } = Input;
const STORAGE_KEY = 'search_history';

interface HomeModalCommentProps {
    isModalCommentOpen: boolean;
    onClose: ((e: React.MouseEvent<HTMLButtonElement>) => void) | undefined
}

const HomeModalComment: React.FC<HomeModalCommentProps> = ({ isModalCommentOpen, onClose }) => {

  return (
    <Modal
        title="Basic Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalCommentOpen}
        onCancel={onClose}
        footer={null}
        width="60%"
        styles={{
            body: {
                maxHeight: '60vh',
                overflowY: 'auto',
            },
        }}
      >
       {Array.from({ length: 50 }, (_, i) => (
        <p key={i}>Some contents... #{i + 1}</p>
      ))}
      </Modal>
  );
};

export default HomeModalComment;