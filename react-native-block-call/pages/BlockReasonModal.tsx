import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, NativeModules } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from "react-native-toast-notifications";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { addBlock } from "../redux/slices/blockSlice";
import { BlockItem } from "../redux/interface";
const { DatabaseHelper } = NativeModules;

interface choiceItem {
  id: number;
  name: string;
}

interface BlockReasonModalProps {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
}

const choices: choiceItem[] = [ 
  {id: 1, name: 'Sales/Ads'}, 
  {id: 2, name: 'Fraud'}, 
  {id: 3, name: 'Harassment'}, 
  {id: 4, name: 'Other'} 
];

const BlockReasonModal: React.FC<BlockReasonModalProps> = ({ visible, phoneNumber, onClose }) => {
  const [isModalVisible, setModalVisible] = useState(visible);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [otherText, setOtherText] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const toast = useToast();

  const handleChoiceSelect = (choice: choiceItem) => {
    selectedChoice === choice.id ? setSelectedChoice(null) : setSelectedChoice(choice.id);

    if (choice.id === 4) {
      setOtherText(''); 
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    if (!isModalVisible) {
      onClose(); 
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      let data: BlockItem = { PHONE_NUMBER: phoneNumber, TYPE: selectedChoice ? selectedChoice : -1, DETAIL: otherText, REPORTER: "" }
      const response = await DatabaseHelper.addBlockNumberData(data);
      console.log("response @@@@@ :", response);

      if (response) {
        dispatch(addBlock(response.data));

        toast.show("Complete.", {
          type: "success",
          placement: "bottom",
          duration: 4000,
          animationType: "slide-in",
        });

        onClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          animationType: "slide-in",
          style: {
            zIndex: 100, // Adjust the zIndex value as needed
          },
        });
      } else {
        console.error("Error fetching call logs:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal 
      isVisible={isModalVisible} 
      onBackdropPress={toggleModal} 
      onModalHide={toggleModal}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Select block reason</Text>
        {
          choices.map((choice: choiceItem) => (
            <TouchableOpacity
              key={choice.id}
              style={styles.choiceButton}
              onPress={() => handleChoiceSelect(choice) }>
              <Text style={styles.choiceText}>{choice.name}</Text>
              {selectedChoice === choice.id && <Icon name="check" size={15} style={styles.icon} />}
            </TouchableOpacity>
          ))
        }
        { selectedChoice === 4 && (
          <TextInput
            style={styles.input}
            placeholder="Enter details"
            value={otherText}
            onChangeText={setOtherText}
            multiline={true}
            numberOfLines={4}
          />
        )}
        <TouchableOpacity 
          style={[styles.button, { opacity: selectedChoice ? 1 : 0.6 }]} 
          onPress={handleBlock}
          disabled={!selectedChoice}>
          <Text style={styles.buttonText}>Block</Text>
          {loading && <ActivityIndicator size="small" color="#fff" style={styles.buttonIndicator} />}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    position: 'relative', 
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1, 
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#efefef',
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    borderRadius: 10,
    textAlignVertical: 'top', 
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  choiceText: {
    fontSize: 16,
  },
  icon: {
    color: 'green',
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonIndicator: {
    marginLeft: 10,
  },
});

export default BlockReasonModal;