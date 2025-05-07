import "./index.less"

import React, { useState, useEffect } from 'react';
import { Input, ConfigProvider, Empty, List, Pagination, message, Skeleton, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from "lodash"
import { useQuery } from '@apollo/client';
import { PlusOutlined, OrderedListOutlined, TableOutlined} from '@ant-design/icons';


import HomeGrid from "@/pages/home/HomeGrid";
import HomeList from "@/pages/home/HomeList";
import { query_reports } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';
import { reportItem } from "@/utils/Interface" 

// const { Option } = Select;
const { Search } = Input;

const CustomEmpty = () => (
  <Empty
  image="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
  imageStyle={{ height: 100 }}
  description={<span>No items found</span>}
  />
  );

const ProductList: React.FC = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [reports, setReports] = useState<reportItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<reportItem[]>([]);
  const [pageSizeOptions, setPageSizeOptions] = useState([20, 50, 100, 500, 1000]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: pageSizeOptions[0] });
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchText, setSearchText] = useState('');
  const [loadingDatas, setloadingDatas] = useState(true);

  const { loading: loadingReports, 
          data: dataReports, 
          error: errorReports, 
          refetch: refetchReports } = useQuery(query_reports, {
                                                context: { headers: getHeaders(location) },
                                                variables: { input: {
                                                    searchText,
                                                    page: pagination.current, 
                                                    pageSize: pagination.pageSize
                                                  }
                                                },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only',
                                                notifyOnNetworkStatusChange: false
                                              });

  if (errorReports) {
    console.log("errorReports :", errorReports)
    handlerError(props, errorReports);
  }

  useEffect(()=>{
    console.log("searchText :", searchText)
    refetchReports({input: { searchText, page: pagination.current, pageSize: pagination.pageSize }})
  }, [ searchText, pagination ])

  useEffect(() => {
    if (!loadingReports && dataReports?.reports) {
      const { status, data, totalCount } = dataReports.reports;
      if (status) {

        console.log(">> data :", data)
        // If data is already an array, you can set it directly.
        setReports(data);
        setFilteredReports(data);
        setTotalCount(totalCount);
      } else {
        setReports([]);
        setFilteredReports([]);
        setTotalCount(0);
      }
      setloadingDatas(false);
    }
  }, [dataReports, loadingReports]);
  
  const handleSearch = (value: string) => {
    if(value.trim() === ''){
      return;
    }
    const searchValue = value.trim().toLowerCase();

    console.log("searchValue :", searchValue)
    // const filtered = products.filter(product =>
    //   product.current.name.toLowerCase().includes(searchValue)
    // );

    // setFilteredProducts(filtered);
    // setCurrentPage(1); // Reset to the first page when searching
  };

  const handleFilterChange = (value: string) => {
    // if(value === undefined){
    //   setFilteredProducts(products);
    // }else{
    //   const filtered = products.filter(product =>{
    //     return product.current.plan.includes( parseInt(value) )
    //   });
    //   setFilteredProducts(filtered);
    // }
    // setCurrentPage(1); // Reset to the first page when filtering
  };

  // Function to handle page number and page size changes
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({current: page, pageSize})
  };


  const handleNewReport = () => {
    navigate('/report?mode=added', { state: { mode: "added" } });

    // navigate('/administrator/products/new', { state: { mode: 'added' } })}
  };

  const onMenuItemClick = (id: string | number, action: string | number) =>{
      console.log("onMenuItemClick :", id, action)

      // navigate(`/user?id=${action}`, { state: { id: action } });

      switch(action){
        // Owner post
        case 1: {
          break;
        }

        // Edit
        case 2: {
          break;
        }

        // Delete
        case 3: {
          break;
        }
      }
  }

  // navigate('/profile')
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '10px' }}>
        <Search
          placeholder="Search"
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton
          allowClear
        />
        <Button type="primary" onClick={handleNewReport} icon={<PlusOutlined />}>New</Button>
        <div style={{ display: "flex", gap: "5px" }}>
          <Button
            type={viewMode === "list" ? "primary" : "default"}
            icon={<OrderedListOutlined />}
            onClick={() => setViewMode("list")}
          />
          <Button
            type={viewMode === "grid" ? "primary" : "default"}
            icon={<TableOutlined />}
            onClick={() => setViewMode("grid")}
          />
        </div>
      </div>
      <Skeleton loading={loadingDatas} active>
      <ConfigProvider renderEmpty={() => <CustomEmpty />}>
      {
        viewMode === "list" 
        ? 
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={filteredReports}
            // locale={{ emptyText: 'No items found, please try again later.' }}
            renderItem={(item) => (
              <List.Item className="item-product-list">
                <HomeList
                  report={item}
                  onClick={() => {
                    navigate(`/view?v=${item.report_id}`, { state: { _id: item.report_id } });
                  }}
                  onMenuItemClick={onMenuItemClick}
                />
              </List.Item>
            )}
          />
        : <List
            grid={{ gutter: 16, column: 5 }}
            dataSource={filteredReports}
            locale={{ emptyText: 'No items found, please try again later.' }}
            renderItem={item => (
              <List.Item  className={`item-product-card`}>
                <HomeGrid
                  report= {item}
                  onClick={()=>{
                    navigate(`/view?v=${item.report_id}`, { state: { _id: item.report_id } });
                  }}
                  onMenuItemClick={onMenuItemClick}
                />
              </List.Item>
            )}
          />
      }
      </ConfigProvider>
      </Skeleton>
      { 
        totalCount > 20 &&
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          pageSizeOptions={pageSizeOptions}
          showSizeChanger={true}  // show the dropdown
          total={totalCount}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          onChange={handlePaginationChange}
          style={{ marginTop: 20, marginBottom: 20}}
        />
      }
    </div>
  );
};

export default ProductList;