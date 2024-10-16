import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Avatar, Space, Dropdown, Image } from 'antd';
import moment from "moment";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import _ from "lodash"
import { DownOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

import { query_users } from "@/apollo/gqlQuery"
import { getHeaders, isValidUrl } from "@/utils"
import handlerError from "@/utils/handlerError"

interface DataType {
    current: {
        displayName: string;
        email: string;
        username?: string;
    }
    updatedAt: string;
}

const items = [
    { key: '1', label: 'Edit' },
    { key: '2', label: 'Delete' },
];

const columns = (navigate: ReturnType<typeof useNavigate>) => [
    {
        title: 'Avatar',
        dataIndex: 'avatar',
        render:(avatar: any)=>{
            return isValidUrl(avatar) 
                    ? <Image  width={100} src={avatar} /> 
                    : <Image  width={100} src={"http://localhost:4000/" + avatar} /> 
        }
    },
    {
        title: 'User',
        dataIndex: ['current', 'displayName'] ,
        sorter: (a: DataType, b: DataType) => a.current.displayName.localeCompare(b.current.displayName),
        render: (displayName: string) =>{
            return <>{displayName}</>
        }
    },
    {
        title: 'Email',
        dataIndex: ['current', 'email'],
        sorter: (a: DataType, b: DataType) => a.current.email.localeCompare(b.current.email),
        render: (email: string) =>{
            return <>{email}</>
        }
    },
    {
        title: 'Roles',
        dataIndex: ['current', 'roles'],
        render: (roles: number[]) =>{
            return _.map(roles, role=>{
                return <Tag color="#2db7f5">{role}</Tag>
            })
        }
    },
    {
        title: 'Date',
        dataIndex: 'updatedAt',
        // sorter: (a: DataType, b: DataType) => a.address.localeCompare(b.address),
        render: (timestamp: string) =>{
            return <div>{(moment(new Date(timestamp), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}</div>
        }
    },
    {
        title: 'Action',
        key: 'action',
        sorter: true,
        render: (data: any) => {
            console.log("Action :", data)

            // if(data.roles.includes(1)){
            //     return  <Space size="middle">
            //                 <a onClick={()=>{
            //                     navigate("/administrator/userlist/user")
            //                 }}>View</a>
                            
            //                 <Dropdown menu={{ items }}>
            //                     <a>More <DownOutlined /></a>
            //                 </Dropdown>
            //             </Space>
            // }
            return  <Space size="middle">
                        <a onClick={()=>{
                            navigate("/administrator/userlist/user")
                        }}>View</a>
                        <a onClick={()=>{
                            navigate("/administrator/userlist/tree")
                        }}>Tree</a>
                        <Dropdown menu={{ items }}>
                            <a>More <DownOutlined /></a>
                        </Dropdown>
                    </Space>
        }
    },
];

const UserList: React.FC = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<DataType[]>();
    const [data, setData] = useState<DataType[]>();
    const [files, setFiles] = useState<File[]>([]);
    const { profile } = useSelector((state: any) => state.user);

    // console.log("UserList :", profile.current.roles);

    const { loading: loadingMembers, 
            data: dataMembers, 
            error: errorMembers  } =  useQuery(  query_users, {
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: false,
                                            });
    if(errorMembers){
        handlerError(props, errorMembers)
    }
    useEffect(() => {
        if(!loadingMembers){
            if(!_.isEmpty(dataMembers?.users)){

                console.log("dataMembers?.members :", dataMembers?.users)

                setData([])
                setFilteredData([])
                if(dataMembers.users.status){
                    _.map(dataMembers.users.data, (e, key)=>{
                        
                        // const newItem: DataType = { key, 
                        //                             displayName: e.current.displayName, 
                        //                             email: e.current.email, 
                        //                             avatar: e.current.avatar?.url,  
                        //                             roles: e.current.roles, 
                        //                             timestamp:e.updatedAt}; 
                        // console.log("e :", e, newItem)
                        setData((prevItems) => {
                            if (Array.isArray(prevItems)) { // Check if prevItems is an array
                                return [...prevItems, e];
                            } else {
                                console.error('prevItems is not an array:', prevItems);
                                return [e]; // Fallback to ensure it is always an array
                            }
                        });

                        setFilteredData((prevItems) => {
                            if (Array.isArray(prevItems)) { // Check if prevItems is an array
                                return [...prevItems, e];
                            } else {
                                console.error('prevItems is not an array:', prevItems);
                                return [e]; // Fallback to ensure it is always an array
                            }
                        });
                    })
                }
            }
        }
    }, [dataMembers, loadingMembers])

    const handleSearch = (value: string) => {
        // setSearchText(value);
        // const filtered = data?.filter((item) => 
        //     item.user.toLowerCase().includes(value.toLowerCase()) ||
        //     item.filename?.toLowerCase().includes(value.toLowerCase()) || false
        // ) || [];
        // setFilteredData(filtered);
    };

    return (
        <div>
            <Input.Search
                placeholder="Search..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table
                columns={columns(navigate)}
                dataSource={filteredData}
                pagination={{ pageSize: 50 }}
                rowKey="key"
            />
        </div>
    );
};

export default UserList;