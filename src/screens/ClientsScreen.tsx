import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, FAB, Searchbar } from 'react-native-paper';
import { DataService } from '../services/DataService';
import { Client } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClientsScreen = ({ navigation }: any) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    try {
      const data = await DataService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const deleteClient = (clientId: string) => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This will also delete their measurements and orders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataService.deleteClient(clientId);
              loadClients();
            } catch (error) {
              console.error('Error deleting client:', error);
            }
          },
        },
      ]
    );
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <Card style={styles.clientCard}>
      <Card.Content>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{item.name}</Text>
            <Text style={styles.clientGender}>{item.gender}</Text>
          </View>
          <View style={styles.clientActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ClientDetails', { clientId: item.id })}
            >
              <Icon name="visibility" size={20} color="#0d6efd" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteClient(item.id)}
            >
              <Icon name="delete" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>
        {item.email && (
          <Text style={styles.clientEmail}>{item.email}</Text>
        )}
        {item.phone && (
          <Text style={styles.clientPhone}>{item.phone}</Text>
        )}
        {item.notes && (
          <Text style={styles.clientNotes} numberOfLines={2}>{item.notes}</Text>
        )}
        <Text style={styles.clientDate}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Clients Found</Text>
      <Text style={styles.emptyText}>
        Add your first client to get started with measurements and orders.
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddClient')}
      >
        <Text style={styles.addButtonText}>Add First Client</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.subtitle}>Manage your tailoring clients</Text>
      </View>

      <Searchbar
        placeholder="Search clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredClients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddClient')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  searchBar: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  clientCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clientGender: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clientNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    lineHeight: 16,
  },
  clientDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0d6efd',
  },
});

export default ClientsScreen;