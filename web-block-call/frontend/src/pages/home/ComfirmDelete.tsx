import React, { useEffect } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmDeleteProps {
  isComfirmDeleteOpen: boolean;
  content: string;
  onDeleted: () => void;
  onClosed: () => void;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ isComfirmDeleteOpen, content, onDeleted, onClosed }) => {
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    if (isComfirmDeleteOpen) {
      modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content,
        okText: 'DELETE',
        cancelText: 'CLOSE',
        okButtonProps: {
            danger: true, // 🔴 Makes the OK button red
        },
        onOk: () => {
          console.log('Deleted clicked');
          onDeleted();
        },
        onCancel: () => {
          console.log('Cancel clicked');
          onClosed();
        },
      });
    }
  }, [isComfirmDeleteOpen, modal, onClosed]);

  return <>{contextHolder}</>;
};

export default ConfirmDelete;
