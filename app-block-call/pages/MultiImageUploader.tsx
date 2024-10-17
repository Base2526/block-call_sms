import React, { useState } from 'react';
import { View, Text, Image, Button, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

type MultiImageUploaderProps = {
  onImages: (images: SelectedImage[]) => void; 
};

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({onImages}) => {
  const [images, setImages] = useState<SelectedImage[]>([]);

  const pickImages = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        if (response.assets) {
          const selectedImages = response.assets.map(asset => ({
            uri: asset.uri!,
            name: asset.fileName!,
            type: asset.type!,
          }));

          // let file = new ReactNativeFile({
          //   uri: assets.uri,
          //   name: assets.fileName,
          //   type: assets.type,
          // })

          const updatedImages = [...images, ...selectedImages];

          setImages(updatedImages);
          onImages(updatedImages); 
        }
      }
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImages(updatedImages); 
  };

  const submitImages = () => {
    console.log("Images to upload:", images);

    // Here you can handle the upload logic (e.g., sending images to a server)
    // You can use FormData to send files along with your API request.
    // Example:
    // const formData = new FormData();
    // images.forEach((image) => {
    //   formData.append('photos', {
    //     uri: image.uri,
    //     type: image.type,
    //     name: image.name,
    //   });
    // });

    // fetch('YOUR_UPLOAD_URL', {
    //   method: 'POST',
    //   body: formData,
    // }).then((response) => {
    //   console.log("Upload successful:", response);
    // }).catch((error) => {
    //   console.log("Upload failed:", error);
    // });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row',  alignItems: 'center', paddingBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginRight: 5 }}>ไฟล์แนบ</Text>
        <TouchableOpacity 
          onPress={pickImages} 
          style={{ padding: 3, backgroundColor: '#ccc', borderRadius: 10,}}>
          <Icon name="plus" size={30} />
        </TouchableOpacity>
      </View>
      {
        images.length > 0
        ? <View style={styles.imageContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeButton}>
                  <Icon name="close" size={24} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        : <></>
      }
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: .5, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    padding: 5
  },
  imageWrapper: {
    position: 'relative',
    padding: 5,
    // backgroundColor: 'red',
    justifyContent: 'space-between',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ccc',
    borderRadius: 10
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default MultiImageUploader;
