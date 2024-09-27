import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

const TabIconWithMenu = ({ iconName, menuItems }: { iconName: string; menuItems: { label: string; onPress: () => void }[] }) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View >
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<TouchableOpacity style={{ padding:5, marginRight: 10 }} onPress={()=>{
          openMenu()
        }}><Icon name={iconName} size={25} color="#333" style={{  }} /></TouchableOpacity>}
      >
        {menuItems.map((item, index) => (
          <Menu.Item key={index} onPress={() => { 
              item.onPress(); 
              closeMenu(); 
          }} title={item.label} />
        ))}
      </Menu>
    </View>
  );
};

export default TabIconWithMenu;