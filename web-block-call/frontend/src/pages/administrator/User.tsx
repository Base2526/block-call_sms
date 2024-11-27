// src/UserForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Space, Button, Select, Switch, DatePicker, Row, Col, message, Image, Avatar, GetProp, UploadProps} from 'antd';
import moment from 'moment';
import { UploadOutlined, LoadingOutlined, PlusOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import type { RcFile, UploadChangeParam } from 'antd/es/upload/interface';
import { useQuery, useMutation } from "@apollo/client";
import { useLocation } from 'react-router-dom';
import _ from "lodash"

import { mutation_profile, query_user } from "@/apollo/gqlQuery"
import { getHeaders } from "@/utils"

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const { Option } = Select;

interface UserTypes {
  username: string;
  password: string;
  email: string;
  displayName: string;
  roles: number[];
  isActive: number; // 0: FALSE, 1: TRUE
  avatar?: {
    url: string;
    filename: string;
    mimetype: string;
    encoding: string;
  };
  lockAccount: {
    lock: boolean;
    date: Date;
  };
  lastAccess: Date;
}

const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const { REACT_APP_HOST_GRAPHAL }  = process.env
const User: React.FC = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  let { mode, _id } = location.state || { mode: searchParams.get('mode'), _id: searchParams.get('v') };
  const [image, setImage] = useState<File | any>();

  console.log('User : ', searchParams, mode, _id)
  const [user, setUser] = useState<UserTypes>({
      username: '',
      password: '',
      email: '',
      displayName: '',
      roles: [0], // Default role
      isActive: 0,
      lockAccount: {
        lock: false,
        date: new Date(),
      },
      lastAccess: new Date(),
  });

  // const [mode, setMode] = useState<'view' | 'edit'>('view'); // Set default mode to view
  // const [avatar, setAvatar] = useState<File | null>(null); // State for uploaded avatar
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/698.jpg");
  const [loading, setLoading] = useState(false);

  const [onProfile] = useMutation(mutation_profile, {
      context: { headers: getHeaders({})
      },
      update: (cache, {data: {profile}}) => {
          console.log("update :", profile)
      },
      onCompleted(data) {
          console.log("onCompleted :", data)
      },
      onError(error){
          console.log("onError :", error)
      }
  });

  const { loading: loadingUser, data: dataUser, refetch: refetchUser } = useQuery(query_user, {
    context: { headers: getHeaders(location) },
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'network-only',
    skip: _.isEmpty(_id) || mode === 'added'
  });

  useEffect(() => {
    if (_id) {
      refetchUser({ id: _id });
    }
  }, [_id, refetchUser]);

  useEffect(()=>{
    console.log("image :", image, REACT_APP_HOST_GRAPHAL)
  }, [image])

  useEffect(() => {
    if (!loadingUser && !_.isEmpty(dataUser?.user) ) {
      const { status, data } = dataUser?.user;
      if (status) {
        console.log("dataUser :", status, data )
        form.setFieldsValue({
          username: data.current.username,
          displayName: data.current.displayName,
          email: data.current.email,
          // positionId: getPositionId(data.current.positionIds) 
        });

        data.current.avatar ? setImage(data.current.avatar) : ""
      }
    }
  }, [dataUser, loadingUser]);
  
  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

//   const handleFileChange = (info: UploadChangeParam<RcFile>) => {
//     if (info.file.status === 'done') {
//       setUser({
//         ...user,
//         avatar: {
//           url: info.file.response.url, // Assume the server returns a URL
//           filename: info.file.name,
//           mimetype: info.file.type,
//           encoding: info.file.encoding,
//         },
//       });
//     }
//   };
  const handleFileChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
    //   setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        // setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSelectChange = (value: number[]) => {
    setUser({ ...user, roles: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setUser({ ...user, lockAccount: { ...user.lockAccount, lock: checked } });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(user);
    // Here you would usually send the user data to your backend
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return; 
    const file = e.target.files?.[0]; // Access the first file (if any)
    if (file) {
      // setImage(file)
      onProfile({variables:{ input:  { mode: "update_image_profile", userId: _id,  file } }});
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    // onProfile({ variables: { input: { file } } })
    onProfile({variables:{ input:  { mode: "update_image_profile",  file } }});
  };
  
  return (
    <Form 
      form={form}
      onSubmitCapture={handleSubmit} 
      layout="vertical">
       <Space style={{ position: "relative", width: 100, height: 100 }}>
        {/* Image */}
        {
          <Avatar 
            className="user-avator" 
            shape="square"
            size={100} 
            icon={<UserOutlined />}
            src={ image instanceof File? URL.createObjectURL(image) : `http://${REACT_APP_HOST_GRAPHAL}/${ image?.url }` } />
        }
        {/* Edit button */}
        <div
          className="edit"
          style={{
            position: "absolute",
            top: 0,
            right: 3,
            padding: "2px",
          }}
        >
          <input
            type="file"
            id="contained-button-file"
            ref={inputRef}
            style={{ display: "none" }}
            multiple={false}
            accept="image/*"
            onChange={onFileChange}
          />
          <Button icon={<EditOutlined />} type="link" onClick={handleClick} />
        </div>
      </Space>
      <Form.Item 
        label="Username" 
        name="username"
        rules={[{ required: true, message: 'Username' }]}>
        <Input />
      </Form.Item>
      <Form.Item 
        label="Email" 
        name="email"
        rules={[{ required: true, message: 'email' }]}>
        <Input/>
      </Form.Item>
      <Form.Item
        label="ชื่อ"
        name="displayName"
        rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Roles" required>
        <Select
          mode="multiple"
          value={user.roles}
          onChange={handleSelectChange}
          disabled={mode === 'view'}
        >
          <Option value={0}>Authenticated</Option>
          <Option value={1}>Administrator</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Is Active">
        <Switch
          checked={user.isActive === 1}
          onChange={(checked) => setUser({ ...user, isActive: checked ? 1 : 0 })}
          disabled={mode === 'view'}
        />
      </Form.Item>
      <Form.Item label="Lock Account">
        <Switch
          checked={user.lockAccount.lock}
          onChange={handleSwitchChange}
          disabled={mode === 'view'}
        />
      </Form.Item>
      <Form.Item label="Last Access Date">
        <DatePicker
          value={user.lastAccess ? moment(user.lastAccess) : null}
          onChange={(date) => setUser({ ...user, lastAccess: date?.toDate() || new Date() })}
          disabled={mode === 'view'}
        />
      </Form.Item>
      <Row gutter={16}>
        <Col>
          {mode === 'view' ? (
            <Button type="primary" onClick={() => {}}>
              Edit
            </Button>
          ) : (
            <>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={() => {}} style={{ marginLeft: '8px' }}>
                Cancel
              </Button>
            </>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default User;