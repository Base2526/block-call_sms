import "./index.less"

import React, { useState, useEffect } from 'react';
import { Input, Select, List, Pagination, message, Skeleton, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from "lodash"
import { useQuery } from '@apollo/client';
import { PlusOutlined } from '@ant-design/icons';

import { addCart, removeCart } from '@/stores/user.store';
import HomeCard from "@/pages/home/HomeCard"
import { ProductItem } from "@/interface/user/user"
import { guery_reports } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';

interface reportItem {
  _id: string;
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
      images: any[]; // URLs or file paths
  }
}

const { Option } = Select;
const { Search } = Input;

const ProductList: React.FC = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [reports, setReports] = useState<reportItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<reportItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); 

  const { loading: loadingReports, 
          data: dataReports, 
          error: errorReports, 
          refetch: refetchReports } = useQuery(guery_reports, {
    context: { headers: getHeaders(location) },
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  });

  if (errorReports) {
      handlerError(props, errorReports);
  }

  useEffect(() => {
    if (!loadingReports && dataReports?.reports) {

      console.log("loadingReports :", dataReports)

      setReports([]);
      setFilteredReports([]);
      if (dataReports.reports.status) {
        _.map(dataReports.reports.data, (e) => {
          setReports((prevItems) => Array.isArray(prevItems) ? [...prevItems, e] : [e]);
          setFilteredReports((prevItems) => Array.isArray(prevItems) ? [...prevItems, e] : [e]);
        });
      }
    }
  }, [dataReports, loadingReports]);

  const handleSearch = (value: string) => {
    // const searchValue = value.toLowerCase();
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
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedProducts = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleNewReport = () => {
    navigate('/report?mode=added', { state: { mode: "added" } });

    // navigate('/administrator/products/new', { state: { mode: 'added' } })}
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '10px' }}>
        <Search
          placeholder="Search report name"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        {/* <Select
          placeholder="Filter by plan"
          onChange={handleFilterChange}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="1">Plan front</Option>
          <Option value="2">Plan back</Option>
        </Select> */}
        <Button type="primary" onClick={handleNewReport} icon={<PlusOutlined />}>
          New Report
        </Button>
      </div>

      <Skeleton loading={loadingReports} active>
        <List
          grid={{ gutter: 16, column: 5 }}
          dataSource={paginatedProducts}
          renderItem={item => (
            <List.Item  className={`list-item-product-card`}>
              <HomeCard
                report= {item}
                onClick={()=>{
                  navigate(`/view?v=${item._id}`, { state: { _id: item._id } });
                }}
                // onAddToCart={()=>{
                //   dispatch(addCart(item));
                //   message.success('Add to cart!');
                // }}
                // onDeleteForCart={()=>{
                //   dispatch(removeCart(item._id));
                //   message.warning('Delete from cart!');
                // }}
                // onBuy={()=>{
                //   navigate("/cart"); 
                // }}
              />
            </List.Item>
          )}
        />
      </Skeleton>

      { 
        filteredReports.length > 20 &&
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredReports.length}
          onChange={handlePaginationChange}
          style={{ marginTop: 20, marginBottom: 20}}
        />
      }
      
    </div>
  );
};

export default ProductList;