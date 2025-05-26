import "./index.less"

import React, { useState, useEffect } from 'react';
import { Input, ConfigProvider, Empty, List, Pagination, message, Skeleton, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from "lodash";
import { useQuery, useMutation } from '@apollo/client';
import { PlusOutlined, OrderedListOutlined, TableOutlined} from '@ant-design/icons';

import HomeGrid from "@/pages/home/HomeGrid";
import HomeList from "@/pages/home/HomeList";
import { query_reports, mutation_bookmark } from '@/apollo/gqlQuery';
import { getHeaders } from '@/utils';
import handlerError from '@/utils/handlerError';
import { reportItem } from "@/utils/Interface";
import SearchComponent from "@/pages/home/SearchComponent";
import HomeModalComment from "@/pages/home/HomeModalComment";
import ComfirmDelete from "@/pages/home/ComfirmDelete";

import  { DefaultRootState } from '@/interface/DefaultRootState';

// const { Search } = Input;

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
  const { logged, device, profile } = useSelector((state: DefaultRootState) => state.user);

  const [reports, setReports] = useState<reportItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<reportItem[]>([]);
  const [pageSizeOptions, setPageSizeOptions] = useState([20, 50, 100, 500, 1000]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: pageSizeOptions[0] });
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchText, setSearchText] = useState('');
  const [loadingDatas, setloadingDatas] = useState(true);

  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [isComfirmDeleteOpen, setIsComfirmDeleteOpen] = useState(false);

  const _variables = {
    input: {
      searchText,
      page: pagination.current, 
      pageSize: pagination.pageSize
    }
  };

  const [onBookmark] = useMutation(mutation_bookmark, {
    context: { headers: getHeaders({}) },
    // Optimistic UI updates could be re-enabled with minimal state for quick feedback
    update: (cache, { data: { bookmark } }, { variables }) => {
      const { status, isBookmark } = bookmark;
      const input = (variables as { input?: any })?.input;

      console.log("bookmark :", bookmark, input);
      
      const existingReports = cache.readQuery<any>({
        query: query_reports,
        variables: _variables,
      });

      if (!existingReports) return;

      cache.writeQuery({
        query: query_reports,
        variables: _variables,
        data: {
          reports: {
            ...existingReports.reports,
            data: existingReports.reports.data.map((report: any) => {
              if (report.report_id === input.post_id) {
                const alreadyBookmarked = report.bookmarks.some(
                  (bm: any) => bm.user_id === profile.id
                );
      
                return {
                  ...report,
                  bookmarks: alreadyBookmarked
                    ? report.bookmarks.filter((bm: any) => bm.user_id !== profile.id)
                    : [...report.bookmarks, { user_id: profile.id }]
                };
              }
      
              return report;
            })
          }
        }
      });
    },
    onCompleted: (data, clientOptions) => {
      const { status, isBookmark }  = data?.bookmark;
      if(status) isBookmark ? message.success('Bookmark', 2.5) : message.error('Unbookmark', 2.5)
    },
  });

  const { loading: loadingReports, 
          data: dataReports, 
          error: errorReports, 
          refetch: refetchReports } = useQuery(query_reports, {
                                                context: { headers: getHeaders(location) },
                                                variables: _variables,
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

  const onDropdownItemClick = (_id: string | number, action: string | number) =>{
      console.log("onDropdownItemClick :", _id, action)

      // navigate(`/user?id=${action}`, { state: { id: action } });

      switch( parseInt(action as string, 10) ){
        // Owner post
        case 1: {
          console.log("Owner post");
          break;
        }

        // Edit
        case 2: {
          navigate('/report?mode=edited', { state: { mode: "edited", _id } });
          break;
        }

        // Delete
        case 3: {
          setIsComfirmDeleteOpen(true);
          break;
        }
      }
  }

  const showModalComment = () => {
    setIsModalCommentOpen(true);
  };

  // navigate('/profile')
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '10px' }}>
        <SearchComponent 
          onSearchChange={(text) => {
            console.log( "SearchWithHistory :", text );
            setSearchText( text );
          }}
        />
        {/* <Search
          placeholder="Search"
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton
          allowClear
        /> */}
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
                  current_user={profile}
                  report={item}
                  onClick={() => {
                    navigate(`/view?v=${item.report_id}`, { state: { _id: item.report_id } });
                  }}
                  onDropdownItemClick={onDropdownItemClick}
                  onActionItemClick={(post_id, action)=> {
                    console.log("onBookmarkClick @1", post_id, action)  

                    switch(action){
                      case "bookmark":{
                        onBookmark({variables:{ input:  { post_id } }});
                        break;
                      }

                      case "comment":{
                        // showModalComment();
                        break;
                      }
                    }
                  }}
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
                  current_user={profile}
                  report= {item}
                  onClick={()=>{
                    navigate(`/view?v=${item.report_id}`, { state: { _id: item.report_id } });
                  }}
                  onDropdownItemClick={onDropdownItemClick}
                  onActionItemClick={(post_id, action)=> {
                    console.log("onBookmarkClick @1", post_id, action)  

                    switch(action){
                      case "bookmark":{
                        onBookmark({variables:{ input:  { post_id } }});
                        break;
                      }

                      case "comment":{
                        // showModalComment();
                        break;
                      }
                    }
                  }}
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

      {
        isModalCommentOpen 
        ? <HomeModalComment isModalCommentOpen={isModalCommentOpen} onClose={()=>{setIsModalCommentOpen(false)}}/>
        : null
      }

      {
        isComfirmDeleteOpen
        ? <ComfirmDelete 
            isComfirmDeleteOpen={isComfirmDeleteOpen} 
            content="" 
            onDeleted={()=>{
              console.log("onDeleted");

              setIsComfirmDeleteOpen(false)
            }} 
            onClosed={()=>setIsComfirmDeleteOpen(false)}/>
        : null
      }
      {/*  */}
    </div>
  );
};

export default ProductList;