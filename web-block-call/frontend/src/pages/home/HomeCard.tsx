import React from 'react';
import { Card, Button, Image } from 'antd';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { DefaultRootState } from '@/interface/DefaultRootState';
import _ from "lodash"
import { ProductItem } from "@/interface/user/user"

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
      images: any[]; // URLs or file paths
  }
}

// Define a TypeScript interface for card props
interface ProductCardProps {
  report: reportItem;
  onClick?: () => void;
  onAddToCart?: () => void;
  onDeleteForCart?: () => void;
  onBuy?: () => void;
}

const { REACT_APP_HOST_GRAPHAL } = process.env;
const HomeCard: React.FC<ProductCardProps> = ({
  report,
  onClick,
  onAddToCart,
  onDeleteForCart,
  onBuy
}) => {
  const { carts } = useSelector((state: DefaultRootState) => state.user);

  // let inCart = false;
  // if(carts){
  //   inCart = carts.some((item) => item._id === product._id);
  // }
  
  const items = _.map(report.current.images, v=> `http://${REACT_APP_HOST_GRAPHAL}/${v.url}`);
  return (
    <Card
      hoverable
      cover={ 
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <Image.PreviewGroup items={items}>
            <Image
              style={{
                objectFit: 'cover',
                height: '200px',
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
              }}
              width="100%"
              src={`${items[0]}`} // Display the first image
            />
          </Image.PreviewGroup>
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              backgroundColor: 'gray',
              color: 'white',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '12px',
            }}
          >
            {items.length} {/* Display the number of images */}
          </div>
        </div>
      }>
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <Card.Meta 
          title={report.current.sellerFirstName} 
          description={
            <div style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {report.current.additionalInfo}
            </div>
          }   
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        {/* <p onClick={onClick} style={{ fontSize: '12px', color:"rgba(0, 0, 0, 0.45)" }}>Max quantity: {'product.current.quantity'}</p> */}
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>${report.current.transferAmount}</p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', // Align buttons to the end of the flex container
          gap: '8px' // Space between buttons
        }}>
          {/* <Button
            className='ant-btn-product-card'
            type="dashed"
            onClick={inCart ? onDeleteForCart : onAddToCart}>
            {inCart ? 'Delete form cart' : 'Add to cart'}
          </Button> */}
          <Button className='ant-btn-like' type="primary" icon={<LikeOutlined />} onClick={onBuy} />
          <Button className='ant-btn-dislike' type="primary" icon={<DislikeOutlined />} onClick={onBuy} />
        </div>
      </div>
    </Card>
  );
};

export default HomeCard;