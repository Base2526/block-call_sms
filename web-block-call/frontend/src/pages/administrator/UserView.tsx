import React, { FC, useState, useRef, useEffect } from 'react';
import { Card, Descriptions, Typography, Button, Input, message, UploadProps, Image as ImagesAntd, Space, Avatar, Spin } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined, CopyOutlined, DownloadOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from "@apollo/client";
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';

import { query_user } from "@/apollo/gqlQuery";
import { getHeaders, getCookie } from "@/utils";
import { updateProfile } from '@/stores/user.store';
import "@/pages/profile/index.less";
import handlerError from "@/utils/handlerError"
import { DefaultRootState } from "@/interface/DefaultRootState"
import _ from "lodash"

const { Paragraph, Text } = Typography;


const { REACT_APP_HOST_GRAPHAL }  = process.env

const UserView: FC = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  let { id } = location.state || {id: searchParams.get('id')}; // Retrieve the state

  const canvasRef = useRef(null);
  // const { profile } = useSelector((state: DefaultRootState) => state.user);
  const [loadingUpdateProfile, setLoadingUpdateProfile] = useState(false);

  const [user, setUser] = useState<any>();
    
  const inputRef = useRef<HTMLInputElement>(null);

  const { loading: loadingUser, error: errorUser, data: dataUser, refetch: refetchUser } = useQuery(query_user, {
    context: { headers: getHeaders(location) },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'network-only',
    skip: _.isEmpty(id) 
  });

  if (errorUser) {
    handlerError(props, errorUser);
  }

  useEffect(() => {
    if (id) {
      refetchUser({ id  });
    }
  }, [id, refetchUser]);

  useEffect(() => {
    if (!loadingUser && !_.isEmpty(dataUser?.user) ) {
      const { status, data } = dataUser?.user;
      if (status) {
        console.log("dataUser :", status, data )

        setUser(data);
      }
    }
  }, [dataUser, loadingUser]);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div style={{ padding: '3px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', padding: "10px" }}>
          <Space style={{ position: "relative", width: 100, height: 100 }}>
            {/* Loading spinner */}
            {loadingUpdateProfile && (
              <Spin
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              />
            )
            }
            {
              user?.display_name
              ? <ImagesAntd 
                  src={`http://${REACT_APP_HOST_GRAPHAL}/` + user?.url}
                  alt="avatar"
                  width={100}
                  style={{ borderRadius: 10, opacity: loadingUpdateProfile ? 0.5 : 1, border: "1px solid #333" }}
                />
              : <Avatar 
                  className="user-avator" 
                  shape="square"
                  size={100} 
                  icon={<UserOutlined />} />
            }
          </Space>
          <div style={{ marginLeft: '20px' }}>
            <h2>{user?.display_name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <div>
          {JSON.stringify(user, null, 2)}
        </div>
        <div>
          { getCookie('usida') }
        </div>
        <Descriptions title="User Information" bordered column={1} style={{ marginTop: '20px' }}>
          {/* <Descriptions.Item label="Phone"><Paragraph className='ant-typography-tel' copyable>{profile?.current?.tel}</Paragraph></Descriptions.Item>
          <Descriptions.Item label="Address">{ profile?.current?.address !== undefined ? <Paragraph className='ant-typography-tel' copyable>{profile?.current?.address}</Paragraph> : <></>  }</Descriptions.Item> */}
          <Descriptions.Item label="My Reports">
            <Button 
              type="primary" 
              style={{ marginRight: '10px' }}
              onClick={()=>{
                // navigate('/my_list')

                // onTest({ variables: { input: { "test": "abc" } } })
                // 
              }}>TEST</Button>
          </Descriptions.Item>
          {/* <Descriptions.Item label="QR URL">
            <Input.Group compact>
              <Input style={{ width: 'calc(100% - 32px)' }} value={"http://167.99.75.91/register/" + profile._id} readOnly />
              <Button icon={<CopyOutlined />} onClick={() => copyToClipboard("http://167.99.75.91/register/" + profile._id)} />
            </Input.Group>
          </Descriptions.Item>
          <Descriptions.Item label="Photo QR">
            <div className="qr-container">
              {
                profile?._id !== undefined
                ? <QRCode 
                    ref={canvasRef}
                    value={`http://167.99.75.91/register/${encodeURIComponent(profile?._id)}`} 
                    size={100} 
                    viewBox={`0 0 256 256`}/>
                : <></>
              } 
              <Button
                icon={<DownloadOutlined />}
                onClick={downloadQRCode}
                className="download-button"/>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Wallet">
            <Button 
              type="primary" 
              style={{ marginRight: '10px' }}
              onClick={()=>{
                navigate('/administrator/wallet')
              }}>Show Wallet</Button>
          </Descriptions.Item>
          <Descriptions.Item label="Tree">
            <Button 
              type="primary" 
              style={{ marginRight: '10px' }}
              onClick={()=>{
                navigate('/administrator/userlist/tree')
              }}>Show Tree</Button>
          </Descriptions.Item>
          <Descriptions.Item label="Purchases">
            <Button 
              type="primary" 
              style={{ marginRight: '10px' }}
              onClick={()=>{
                navigate('/purchases/1')
              }}>Purchases</Button>
          </Descriptions.Item> */}
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserView;
