import React, { useState, useEffect, Key } from 'react';
import { Table, Input, Tag, Button, Space, Dropdown, Image,  } from 'antd';
import moment from "moment";
import { useQuery, useMutation } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import _ from "lodash"
import { DownOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

import { query_reports, mutation_report } from "@/apollo/gqlQuery"
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
        seller_first_name: string;
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
        title: 'Picture',
        dataIndex: ['images'],
        render: (images: any[]) => {
            const items = _.map(images, v=> `http://localhost:4000/${v.url}`);
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
        title: 'Seller Name',
        dataIndex: ['seller_first_name'],
        sorter: (a: reportItem, b: reportItem) => a.current.seller_first_name.localeCompare(b.current.seller_first_name) ,
        render: (value: string) =>{
            return <>{value}</>
        }
    },
    {
        title: 'Info',
        dataIndex: ['additional_info'],
        // sorter: (a: reportItem, b: reportItem) => a.current.localeCompare(b.email),
        render: (additionalInfo: string) =>{
            return <>{ additionalInfo }</>
        }
    },
    {
        title: 'Owner',
        dataIndex: ['owner', 'current', 'displayName'],
        render: (displayName: string) =>{
            return <Tag color="#2db7f5">{displayName}</Tag>
        }
    },
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
            // console.log("Action :", item)
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
                            console.log("item :", item)
                            navigate(`/view?v=${item.report_id}`, { state: { _id: item.report_id } });
                        }}>View</a>
                        <a onClick={()=>{
                            navigate('/report?mode=edited', { state: { mode: "edited", _id: item.report_id } });
                        }}>Edit</a>
                        <Dropdown menu={{ items }}>
                            <a>More <DownOutlined /></a>
                        </Dropdown>
                    </Space>
        }
    },
];

const ReportList: React.FC = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useState<string>('');
    const [filteredData, setFilteredData] = useState<reportItem[]>();
    const [data, setData] = useState<reportItem[]>();
    const [files, setFiles] = useState<File[]>([]);
    const { profile } = useSelector((state: any) => state.user);

    const [pageSizeOptions, setPageSizeOptions] = useState([10, 50, 100])
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: pageSizeOptions[0],
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // State for selected rows
  
    const [onReport] = useMutation(mutation_report, {
        context: { headers: getHeaders(location) },
        update: (cache, { data: { report } }) => {
          console.log("report: ", report);
        },
        onCompleted: (data, clientOptions) => {
        //   setLoading(false);  
        //   let { variables: { input } } : any = clientOptions;
        //   if(input?.mode === 'added'){
        //     message.success('Added successfully!');
        //     navigate(-1);
        //   }else if(input?.mode === 'edited'){
        //     message.success('Edited successfully!');
        //     navigate(-1);
        //   }
        },
        onError: (error) => {
        //   setLoading(false);
          handlerError(props, error);
        }
    });

    const { loading: loadingReports, 
            data: dataReports, 
            error: errorReports,
            refetch: refetchReports  } =  useQuery( query_reports, {
                                                context: { headers: getHeaders(location) },
                                                variables: { input: {
                                                                    page: pagination.current, 
                                                                    pageSize: pagination.pageSize
                                                                }
                                                            },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: false,
                                            });

    if (errorReports) {
        handlerError(props, errorReports);
    }

    useEffect(() => {
        if(!loadingReports){
            if(!_.isEmpty(dataReports?.reports)){

                console.log("dataReports?.reports :", dataReports?.reports)

                setData([])
                setFilteredData([])
                if(dataReports.reports.status){
                    _.map(dataReports.reports.data, (e, key)=>{
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

    useEffect(()=>{
        refetchReports({input: { page: pagination.current, pageSize: pagination.pageSize }})
    }, [ pagination ])

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

    // Handle row selection changes
    const handleRowSelectionChange = (
        newSelectedRowKeys: Key[], // Selected row keys
        newSelectedRows: reportItem[], // Selected rows
        info: { type: string } // Information about the selection type
    ) => {
        console.log('Selected Row Keys:', newSelectedRowKeys);
        console.log('Selected Rows:', newSelectedRows);
        console.log('Selection Info:', info);
        setSelectedRowKeys(newSelectedRowKeys); // Update selected row keys
    };

    const onClickDelete = () => {
        console.log("onClickDelete :", selectedRowKeys)

        onReport({ variables: { input: { mode: "deleted", reportIds: selectedRowKeys } } });
    }

    const handleTableChange = (pagination: any) => {
        setPagination(pagination);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPagination({ ...pagination, pageSize: newPageSize });
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
            {
                selectedRowKeys.length > 0
                ?   <div>
                        <Button type="primary" danger onClick={onClickDelete} disabled={!(selectedRowKeys.length > 0)} icon={<DeleteOutlined />} />
                        {selectedRowKeys.length > 0 ? `Selected ${selectedRowKeys.length} items` : null}
                    </div>
                :   <div />
            }
            
            <Table
                columns={columns(navigate)}
                dataSource={filteredData}
                pagination={{ 
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: dataReports?.reports.totalCount, // Use total count from the server
                    pageSizeOptions,
                    showSizeChanger: true,
                    onShowSizeChange: (_, size) => handlePageSizeChange(size),
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
                rowKey="report_id"
                rowSelection={{
                    selectedRowKeys, // This binds the selectedRowKeys state
                    onChange: handleRowSelectionChange, // Callback to handle row selection changes
                }}  
            />
        </div>
    );
};

export default ReportList;