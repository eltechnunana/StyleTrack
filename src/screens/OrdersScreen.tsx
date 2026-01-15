import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Card, FAB, Searchbar, Chip } from 'react-native-paper';
import { DataService } from '../services/DataService';
import { Order } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      const data = await DataService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const deleteOrder = (orderId: string) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const allOrders = await DataService.getOrders();
              const updatedOrders = allOrders.filter(o => o.id !== orderId);
              await AsyncStorage.setItem('@styletrack:orders', JSON.stringify(updatedOrders));
              loadOrders();
            } catch (error) {
              console.error('Error deleting order:', error);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'pending': return '#ff9800';
      case 'in-progress': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'delivered': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'in-progress': return 'build';
      case 'completed': return 'check-circle';
      case 'delivered': return 'local-shipping';
      default: return 'help';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.clientName}>{item.clientName}</Text>
          </View>
          <View style={styles.orderActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Invoice', { orderId: item.id })}
            >
              <Icon name="receipt" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
            >
              <Icon name="visibility" size={20} color="#0d6efd" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteOrder(item.id)}
            >
              <Icon name="delete" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.orderDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.orderDetails}>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
            icon={() => (
              <Icon name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
            )}
          >
            {item.status.replace('-', ' ').toUpperCase()}
          </Chip>
          
          {item.price && (
            <Text style={styles.orderPrice}>
              ${item.price.toFixed(2)}
            </Text>
          )}
        </View>

        {item.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}

        {item.notes && (
          <Text style={styles.orderNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        <Text style={styles.orderDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="assignment" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Orders Found</Text>
      <Text style={styles.emptyText}>
        Create your first order to start managing tailoring projects.
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddOrder')}
      >
        <Text style={styles.addButtonText}>Create First Order</Text>
      </TouchableOpacity>
    </View>
  );

  const statusChips = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Delivered', value: 'delivered' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Manage tailoring orders</Text>
      </View>

      <Searchbar
        placeholder="Search orders..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
      >
        {statusChips.map((chip) => (
          <Chip
            key={chip.value}
            mode={statusFilter === chip.value ? 'contained' : 'outlined'}
            onPress={() => setStatusFilter(chip.value)}
            style={styles.statusChip}
            textStyle={statusFilter === chip.value ? styles.statusChipTextActive : styles.statusChipText}
          >
            {chip.label}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddOrder')}
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
  statusFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: '#fff',
  },
  statusChipTextActive: {
    color: '#fff',
  },
  statusChipText: {
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  orderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  orderNotes: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    lineHeight: 16,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
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

export default OrdersScreen;