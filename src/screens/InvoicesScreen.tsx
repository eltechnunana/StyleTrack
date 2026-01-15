import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button, Searchbar, FAB, Chip } from 'react-native-paper';
import { DataService } from '../services/DataService';
import { Invoice } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InvoicesScreenProps {
  navigation: any;
}

const InvoicesScreen = ({ navigation }: InvoicesScreenProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter, filterInvoices]);

  const loadInvoices = async () => {
    try {
      const data = await DataService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const filterInvoices = useCallback(() => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#9E9E9E';
      case 'sent': return '#2196F3';
      case 'paid': return '#4CAF50';
      case 'overdue': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'edit';
      case 'sent': return 'send';
      case 'paid': return 'check-circle';
      case 'overdue': return 'warning';
      default: return 'help';
    }
  };

  const shareInvoice = async (invoice: Invoice) => {
    try {
      const invoiceText = generateInvoiceText(invoice);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Share.share({
          message: invoiceText,
          title: `Invoice ${invoice.invoiceNumber}`,
        });
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  const generateInvoiceText = (invoice: Invoice) => {
    return `
INVOICE #${invoice.invoiceNumber}

From: ${invoice.companyInfo.name}
Phone: ${invoice.companyInfo.phone}
Email: ${invoice.companyInfo.email}

To: ${invoice.clientName}
Issue Date: ${invoice.issueDate.toLocaleDateString()}
Due Date: ${invoice.dueDate.toLocaleDateString()}

Items:
${invoice.items.map(item => `• ${item.description} - Qty: ${item.quantity} - $${item.unitPrice.toFixed(2)} - Total: $${item.total.toFixed(2)}`).join('\n')}

Subtotal: $${invoice.subtotal.toFixed(2)}
Tax: $${invoice.tax.toFixed(2)}
Total: $${invoice.total.toFixed(2)}

Status: ${invoice.status.toUpperCase()}

Terms & Conditions:
${invoice.terms || 'Standard terms and conditions apply.'}
    `;
  };

  const deleteInvoice = (invoiceId: string) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataService.deleteInvoice(invoiceId);
              loadInvoices();
            } catch (error) {
              console.error('Error deleting invoice:', error);
            }
          },
        },
      ]
    );
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Card style={styles.invoiceCard}>
      <Card.Content>
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>#{item.invoiceNumber}</Text>
            <Text style={styles.clientName}>{item.clientName}</Text>
          </View>
          <View style={styles.invoiceActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => shareInvoice(item)}
            >
              <Icon name="share" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteInvoice(item.id)}
            >
              <Icon name="delete" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.invoiceDetails}>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
            icon={() => (
              <Icon name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
            )}
          >
            {item.status.toUpperCase()}
          </Chip>
          
          <Text style={styles.invoiceAmount}>
            ${item.total.toFixed(2)}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            Issue: {item.issueDate.toLocaleDateString()}
          </Text>
          <Text style={styles.dateText}>
            Due: {item.dueDate.toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.itemCount}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="receipt" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Invoices Found</Text>
      <Text style={styles.emptyText}>
        Create invoices from orders to start managing your billing.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Orders')}
        style={styles.emptyButton}
        icon="arrow-right"
      >
        Go to Orders
      </Button>
    </View>
  );

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Manage your billing</Text>
      </View>

      <Searchbar
        placeholder="Search invoices..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.statusFilterContainer}>
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            mode={statusFilter === option.value ? 'contained' : 'outlined'}
            onPress={() => setStatusFilter(option.value as any)}
            style={styles.statusButton}
            compact
          >
            {option.label}
          </Button>
        ))}
      </View>

      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Orders')}
        color="#fff"
        label="New Invoice"
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statusButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  invoiceCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d6efd',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0d6efd',
  },
});

export default InvoicesScreen;