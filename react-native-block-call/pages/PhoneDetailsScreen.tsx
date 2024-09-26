import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const PhoneDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>+61 450 228 714</Text>
        <Text style={styles.subHeaderText}>No results found</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tell us who this is"
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>SMS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Block</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.callHistory}>
        <Text style={styles.callText}>2023/11/16 Thu 10:22</Text>
        <Text style={styles.callSubText}>Incoming call • 31s</Text>
        <Text style={styles.callText}>2023/11/16 Thu 10:01</Text>
        <Text style={styles.callSubText}>Not answered</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tell us who this is"
      />

      <TouchableOpacity style={styles.searchButton}>
        <Text style={styles.searchText}>Search more info for this number</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#aaa',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  actionText: {
    fontSize: 16,
  },
  callHistory: {
    marginBottom: 16,
  },
  callText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  callSubText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  searchButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  searchText: {
    fontSize: 16,
  },
});

export default PhoneDetailsScreen;
