import { useNavigation } from '@react-navigation/native';
import { UserContext } from 'Contexts/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  Button,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import Loading from 'screens/Loading';
import FirebaseService from 'service/firebase';

interface Credential {
  _id: string;
  type: string;
  value: string;
  verified: boolean;
  url?: string; // Assume each credential might have an optional URL
}

interface Vendor {
  _id: string;
  name: string;
  address: {
    city: string;
  };
  credentials: Credential[];
}

interface ErrorState {
  error: boolean;
  message: string;
}

function IdList() {
  const userContext = useContext(UserContext);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ error: false, message: '' });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For fullscreen image

  const navigation = useNavigation();

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  const fetchVendors = async () => {
    setRefresh(true);
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;

    const token = await getToken({ template: 'eventhand-client' });

    const request = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();

      console.log(data);

      if (res.status === 200) {
        if (Array.isArray(data)) {
          const filteredVendors = data
            .map((vendor: Vendor) => ({
              ...vendor,
              credentials: Array.isArray(vendor?.credentials)
                ? vendor.credentials.filter(
                    (cred: Credential) => cred?.verified === false
                  )
                : [],
            }))
            .filter((vendor: Vendor) => vendor.credentials.length > 0);

          setVendors(filteredVendors);
          console.log(
            'VENDOR DATA SUCCESSFULLY LOADED WITH UNVERIFIED CREDENTIALS'
          );
        } else {
          throw new Error('Vendors data is not in the expected format');
        }
      } else {
        throw new Error(
          `Failed to fetch vendors, received status code ${res.status}`
        );
      }
    } catch (error: any) {
      console.error(`Error fetching vendors: ${error.message}`);
      setError({
        error: true,
        message: `Error fetching vendors: ${error.message}`,
      });
    } finally {
      setRefresh(false);
    }
  };

  const updateCredentialStatus = async (
    vendorId: string,
    credential: Credential,
    verified: string
  ) => {
    const token = await getToken({ template: 'eventhand-client' });

    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`;

    const request = {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        credentials: [
          {
            type: credential.type,
            url: `${credential.url}`,
            expiry: '2025-08-26T00:00:00.000Z',
            verified: verified,
          },
        ],
        visibility: true,
      }),
    };

    try {
      const res = await fetch(url, request);
      if (res.status === 200) {
        console.log('Credential status updated successfully');
        fetchVendors();
      } else {
        console.log(res);
        throw new Error('Failed to update credential');
      }
    } catch (error) {
      console.error(`Error updating credential: ${error}`);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const IdListItem = ({ vendor }: { vendor: Vendor }) => {
    const [idPic, setIdPic] = useState<{ [key: string]: string }>({});

    const downloadIdPic = async (idPicPath: string, credentialId: string) => {
      const firebaseService = FirebaseService.getInstance();
      const idPicture = await firebaseService.getProfilePicture(idPicPath);

      setIdPic((prev) => ({
        ...prev,
        [credentialId]: idPicture || '',
      }));
    };

    useEffect(() => {
      try {
        vendor.credentials.forEach((cred) => {
          if (cred.url) {
            downloadIdPic(cred.url, cred._id);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }, [vendor.credentials]);

    return (
      <View key={vendor._id} style={styles.itemContainer}>
        <Text style={styles.dateText}>{vendor.name}</Text>
        <Text style={styles.dateText}>Location: {vendor.address.city}</Text>
        <View style={styles.separator} />

        {vendor.credentials && vendor.credentials.length > 0 ? (
          vendor.credentials.map((cred: Credential, index: number) => (
            <View key={index}>
              <Text style={styles.budgetText}>
                {cred.type}: {cred.value}
              </Text>
              <Pressable onPress={() => setSelectedImage(idPic[cred._id])}>
                {idPic[cred._id] ? (
                  <Image
                    source={{ uri: idPic[cred._id] }}
                    style={{ width: 200, height: 300 }}
                  />
                ) : (
                  <Text>No image available</Text>
                )}
              </Pressable>

              <View style={styles.buttonGroup}>
                <Button
                  title='Approve'
                  onPress={() =>
                    updateCredentialStatus(vendor._id, cred, 'true')
                  }
                />
                <Button
                  title='Deny'
                  onPress={() =>
                    updateCredentialStatus(vendor._id, cred, 'false')
                  }
                  color='red'
                />
              </View>
            </View>
          ))
        ) : (
          <Text>No credentials available</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <FlatList
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        data={vendors}
        renderItem={({ item }) => <IdListItem vendor={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={fetchVendors}
            colors={['#ff0000']}
            titleColor={'#ff0000'}
            progressBackgroundColor={'#fff'}
          />
        }
      />

      <Modal visible={!!selectedImage} transparent={true} animationType='fade'>
        <View style={styles.modalBackground}>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode='contain'
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 20,
    marginLeft: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightColor: '#fff',
    borderRightWidth: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  budgetText: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '80%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default IdList;
