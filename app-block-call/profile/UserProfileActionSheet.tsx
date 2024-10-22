import React, { useRef } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { TabView, SceneMap } from 'react-native-tab-view';

const FirstRoute = () => {
  const data = Array.from({ length: 30 }, (_, i) => ({ key: `Item ${i + 1}` }));

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text style={styles.item}>{item.key}</Text>}
      keyExtractor={item => item.key}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled // Enable nested scrolling on Android
      style={styles.flatList} // Allow FlatList to grow and fill available space
    />
  );
};

const SecondRoute = () => {
  const data = Array.from({ length: 20 }, (_, i) => ({ key: `Item A${i + 1}` }));

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text style={styles.item}>{item.key}</Text>}
      keyExtractor={item => item.key}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled // Enable nested scrolling on Android
      style={styles.flatList} // Allow FlatList to grow and fill available space
    />
  );
};

const initialLayout = { width: 500 };

const MyActionSheet = () => {
  const actionSheetRef = useRef<ActionSheet>(null);
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Tab 1' },
    { key: 'second', title: 'Tab 2' },
  ]);

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  return (
    <View style={styles.container}>
      <Button title="Open ActionSheet" onPress={() => actionSheetRef.current?.show()} />
      <ActionSheet ref={actionSheetRef} gestureEnabled>
        <View style={styles.tabViewContainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={initialLayout}
          />
        </View>
      </ActionSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabViewContainer: {
    height: 600, // Ensure there's enough height for scrolling
    flex: 1, // Ensure it takes available space
  },
  flatList: {
    flexGrow: 1, // Allow FlatList to grow and fill available space
  },
  item: {
    padding: 20,
    fontSize: 18,
    height: 44,
    color: 'blue',
    backgroundColor: 'red',
  },
});

export default MyActionSheet;
