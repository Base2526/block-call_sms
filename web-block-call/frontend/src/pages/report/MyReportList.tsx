import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Button, Space, Dropdown, Image } from 'antd';
import moment from "moment";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import _ from "lodash"
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

import { guery_my_reports } from "@/apollo/gqlQuery"
import { getHeaders, isValidUrl } from "@/utils"

import handlerError from '@/utils/handlerError';

interface DataType {
    key: string;
    displayName: string;
    email: string;
    avatar?: string;
    roles:number[];
    timestamp: any;
    user?: any; // Optional
    filename?: string; // Optional
}

const items = [
    // { key: '1', label: 'Edit' },
    { key: '2', label: 'Delete' },
];

interface reportItem {
    current:{
        sellerFirstName: string;
        sellerLastName: string;
        idCard: string;
        sellerAccount: string;
        bank: string;
        product: string;
        transferAmount: number;
        transferDate: string; // ISO string
        sellingWebsite: string;
        province: string; // Province ID
        additionalInfo?: string;
        images: string[]; // URLs or file paths
    }
}

const columns = (navigate: ReturnType<typeof useNavigate>) => [
    {
        title: 'Images',
        dataIndex: ['current', 'images'],
        render: (images: any[]) => {
            const items = _.map(images, v=> `http://localhost:1984/${v.url}`);
            return <div style={{position: 'relative', display: 'inline-block'}}>
                        <Image.PreviewGroup items={items}>
                        <div className="image-wrapper" style={{position: 'relative', display: 'inline-block'}} >
                            <Image
                                style={{ borderRadius: 5 }}
                                width={80}
                                src={`${items[0]}`} />
                            <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                backgroundColor: 'gray',
                                color: 'white',
                                borderRadius: '3px',
                                padding: '2px 6px',
                                fontSize: '12px'
                            }}>{ items.length }</div>
                        </div>
                        </Image.PreviewGroup>
                    </div>
        },
    },
    {
        title: 'sellerFirstName',
        dataIndex: ['current', 'sellerFirstName'],
        sorter: (a: reportItem, b: reportItem) => a.current.sellerFirstName.localeCompare(b.current.sellerFirstName) ,
        render: (sellerFirstName: string) =>{
            return <>{sellerFirstName}</>
        }
    },
    {
        title: 'additionalInfo',
        dataIndex: ['current', 'additionalInfo'],
        // sorter: (a: reportItem, b: reportItem) => a.current.localeCompare(b.email),
        render: (additionalInfo: string) =>{
            return <>{ additionalInfo }</>
        }
    },
    // {
    //     title: 'Roles',
    //     dataIndex: 'roles',
    //     render: (roles: number[]) =>{
    //         return _.map(roles, role=>{
    //             return <Tag color="#2db7f5">{role}</Tag>
    //         })
    //     }
    // },
    // {
    //     title: 'Date',
    //     dataIndex: 'timestamp',
    //     // sorter: (a: DataType, b: DataType) => a.address.localeCompare(b.address),
    //     render: (timestamp: string) =>{
    //         return <div>{(moment(new Date(timestamp), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}</div>
    //     }
    // },
    {
        title: 'Action',
        key: 'action',
        sorter: true,
        render: (item: any) => {
            console.log("Action :", item)

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
                            navigate(`/view?v=${item._id}`, { state: { _id: item._id } });
                        }}>View</a>
                        <a onClick={()=>{
                            navigate('/report?mode=edited', { state: { mode: "edited", _id: item._id } });
                        }}>Edit</a>
                        <Dropdown menu={{ items }}>
                            <a>More <DownOutlined /></a>
                        </Dropdown>
                    </Space>
        }
    },
];

const MyReportList: React.FC = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<reportItem[]>();
    const [data, setData] = useState<reportItem[]>();
    const [files, setFiles] = useState<File[]>([]);
    const { profile } = useSelector((state: any) => state.user);

    const { loading: loadingReports, 
            data: dataReports, 
            error: errorReports  } =  useQuery( guery_my_reports, {
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: false,
                                            });

    if (errorReports) {
        handlerError(props, errorReports);
    }

    useEffect(() => {
        if(!loadingReports){
            if(!_.isEmpty(dataReports?.my_reports)){

                console.log("dataReports?.my_reports :", dataReports?.my_reports)

                setData([])
                setFilteredData([])
                if(dataReports.my_reports.status){
                    _.map(dataReports.my_reports.data, (e, key)=>{
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
    }, [dataReports, loadingReports])

    const handleSearch = (value: string) => {
        // setSearchText(value);
        // const filtered = data?.filter((item) => 
        //     item.user.toLowerCase().includes(value.toLowerCase()) ||
        //     item.filename?.toLowerCase().includes(value.toLowerCase()) || false
        // ) || [];
        // setFilteredData(filtered);
    };

    const handleAddReport = () => {
        navigate('/report?mode=added', { state: { mode: "added" } });
    
        // navigate('/administrator/products/new', { state: { mode: 'added' } })}
    };

    return (
        <div>
            <Input.Search
                placeholder="Search..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Button 
                type="primary" 
                onClick={handleAddReport} 
                style={{ marginBottom: 16 }}
                icon={<PlusOutlined />}
            >
                Add New Report
            </Button>
            
            <Table
                columns={columns(navigate)}
                dataSource={filteredData}
                pagination={{ pageSize: 50 }}
                rowKey="key"
            />
        </div>
    );
};

export default MyReportList;