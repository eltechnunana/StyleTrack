import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Card, Button, TextInput } from 'react-native-paper';
import { DataService } from '../services/DataService';
import { Order, Invoice, InvoiceItem, CompanyInfo } from '../types';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InvoiceScreenProps {
  navigation: any;
  route: any;
}

const InvoiceScreen = ({ navigation, route }: InvoiceScreenProps) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'StyleTrack Tailoring Services',
    phone: '+233543958642',
    email: 'eltechnunana@gmail.com',
    address: '123 Fashion Avenue, Style City, SC 12345',
    website: 'www.eltechsolutions.com',
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const TERMS_AND_CONDITIONS = `TERMS & CONDITIONS

1. Validity of Quotation

This quotation is valid for 14 days from the date of issue. Prices and availability may be reviewed after the validity period.

2. Deposit Requirement

Production begins only after a 60% deposit has been paid and confirmed.

3. Final Payment

The remaining 40% balance must be paid upon completion, before delivery or collection of the final product.

4. Express Orders (3–5 Days)

Express or rush orders attract an additional service charge, depending on the urgency and complexity of the request.

5. Client-Related Delays

${companyInfo.name} is not liable for delays resulting from late submission of measurements, approvals, artwork, content, or any required information from the client.

6. Revisions & Adjustments

Changes requested after production has started may attract extra charges and may affect the delivery date.

7. Cancellation Policy

Once a deposit is paid, it becomes non-refundable. Cancellation after production begins will also attract additional charges for work already completed.

8. Inspection & Quality Assurance

All products are inspected before delivery. Clients are encouraged to check all items upon receipt. Any complaints, corrections, or defects must be reported within 48 hours.

9. Ownership of Work

All items remain the property of ${companyInfo.name} until full payment has been received.

10. Delivery

Delivery timelines are estimates and may be affected by unforeseen factors. Clients requesting delivery may incur additional delivery charges.

11. Artwork & Content Submission

Clients are responsible for submitting correct and final artwork/content. ${companyInfo.name} is not responsible for errors arising from incorrect or low-resolution files provided by the client.

12. Warranty

A limited warranty covers workmanship issues only. Damage caused by mishandling, improper installation, or external factors is not covered.

13. Contact Information

For further assistance, please contact:

Phone: ${companyInfo.phone}

Email: ${companyInfo.email}`;

  useEffect(() => {
    loadOrderData();
    loadCompanyInfo();
  }, [orderId, loadOrderData, loadCompanyInfo]);

  const loadOrderData = useCallback(async () => {
    try {
      const orders = await DataService.getOrders();
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        initializeInvoice(foundOrder);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    }
  }, [orderId]);

  const loadCompanyInfo = useCallback(async () => {
    try {
      const settings = await DataService.getSettings();
      if (settings.companyInfo) {
        setCompanyInfo(settings.companyInfo);
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }, []);

  const initializeInvoice = useCallback((orderData: Order) => {
    const subtotal = orderData.price || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      orderId: orderData.id,
      clientId: orderData.clientId,
      clientName: orderData.clientName,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      items: [
        {
          id: '1',
          description: orderData.description || 'Tailoring Services',
          quantity: 1,
          unitPrice: subtotal,
          total: subtotal,
        },
      ],
      subtotal,
      tax,
      total,
      status: 'draft',
      notes,
      terms: TERMS_AND_CONDITIONS,
      companyInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setInvoice(newInvoice);
  }, [taxRate, notes, TERMS_AND_CONDITIONS, companyInfo]);

  const calculateTotals = useCallback(() => {
    if (!invoice) return;

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    setInvoice({
      ...invoice,
      items: invoiceItems,
      subtotal,
      tax,
      total,
      updatedAt: new Date(),
    });
  }, [invoice, invoiceItems, taxRate]);

  useEffect(() => {
    calculateTotals();
  }, [invoiceItems, taxRate, calculateTotals]);

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    setInvoiceItems(updatedItems);
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const saveInvoice = async () => {
    if (!invoice) return;

    try {
      await DataService.saveInvoice({
        ...invoice,
        notes,
        updatedAt: new Date(),
      });
      Alert.alert('Success', 'Invoice saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', 'Failed to save invoice');
    }
  };

  const shareInvoice = async () => {
    if (!invoice) return;

    const invoiceText = generateInvoiceText();
    
    try {
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

  const generateInvoiceText = () => {
    if (!invoice || !order) return '';

    return `
INVOICE

Company: ${companyInfo.name}
Phone: ${companyInfo.phone}
Email: ${companyInfo.email}
Address: ${companyInfo.address}

Invoice Number: ${invoice.invoiceNumber}
Issue Date: ${invoice.issueDate.toLocaleDateString()}
Due Date: ${invoice.dueDate.toLocaleDateString()}

Bill To:
${invoice.clientName}

Items:
${invoice.items.map(item => `${item.description} - Qty: ${item.quantity} - $${item.unitPrice.toFixed(2)} - Total: $${item.total.toFixed(2)}`).join('\n')}

Subtotal: $${invoice.subtotal.toFixed(2)}
Tax (${taxRate}%): $${invoice.tax.toFixed(2)}
Total: $${invoice.total.toFixed(2)}

Notes:
${notes}

Terms & Conditions:
${TERMS_AND_CONDITIONS}
    `;
  };

  if (!invoice || !order) {
    return (
      <View style={styles.container}>
        <Text>Loading invoice...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.subtitle}>Professional Invoice Generator</Text>
      </View>

      {/* Company Information */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Company Information" left={() => <Icon name="business" size={24} color="#0d6efd" />} />
        <Card.Content>
          <TextInput
            label="Company Name"
            value={companyInfo.name}
            onChangeText={(text) => setCompanyInfo({ ...companyInfo, name: text })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Phone Number"
            value={companyInfo.phone}
            onChangeText={(text) => setCompanyInfo({ ...companyInfo, phone: text })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Email Address"
            value={companyInfo.email}
            onChangeText={(text) => setCompanyInfo({ ...companyInfo, email: text })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Business Address"
            value={companyInfo.address || ''}
            onChangeText={(text) => setCompanyInfo({ ...companyInfo, address: text })}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </Card.Content>
      </Card>

      {/* Invoice Details */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Invoice Details" left={() => <Icon name="receipt" size={24} color="#0d6efd" />} />
        <Card.Content>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Number:</Text>
            <Text style={styles.value}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>{invoice.issueDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>{invoice.dueDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{invoice.clientName}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Invoice Items */}
      <Card style={styles.sectionCard}>
        <Card.Title 
          title="Invoice Items" 
          left={() => <Icon name="shopping-cart" size={24} color="#0d6efd" />}
          right={() => (
            <Button mode="text" onPress={addInvoiceItem} icon="plus" compact>
              Add Item
            </Button>
          )}
        />
        <Card.Content>
          {invoiceItems.map((item, index) => (
            <View key={item.id} style={styles.itemContainer}>
              <TextInput
                label={`Item ${index + 1} Description`}
                value={item.description}
                onChangeText={(text) => updateInvoiceItem(item.id, 'description', text)}
                mode="outlined"
                style={styles.itemInput}
              />
              <View style={styles.itemRow}>
                <TextInput
                  label="Quantity"
                  value={item.quantity.toString()}
                  onChangeText={(text) => updateInvoiceItem(item.id, 'quantity', parseInt(text, 10) || 0)}
                  mode="outlined"
                  style={styles.quantityInput}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Unit Price"
                  value={item.unitPrice.toString()}
                  onChangeText={(text) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(text) || 0)}
                  mode="outlined"
                  style={styles.priceInput}
                  keyboardType="numeric"
                />
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
                </View>
                <Button mode="text" onPress={() => removeInvoiceItem(item.id)} icon="close" compact>
                  {' '}
                </Button>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Tax and Totals */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Tax & Totals" left={() => <Icon name="calculate" size={24} color="#0d6efd" />} />
        <Card.Content>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsValue}>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <TextInput
              label="Tax Rate (%)"
              value={taxRate.toString()}
              onChangeText={(text) => setTaxRate(parseFloat(text) || 0)}
              mode="outlined"
              style={styles.taxInput}
              keyboardType="numeric"
            />
            <Text style={styles.totalsValue}>${invoice.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>${invoice.total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Notes */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Additional Notes" left={() => <Icon name="note" size={24} color="#0d6efd" />} />
        <Card.Content>
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Any additional information for the client..."
          />
        </Card.Content>
      </Card>

      {/* Terms & Conditions */}
      <Card style={styles.sectionCard}>
        <Card.Title 
          title="Terms & Conditions" 
          left={() => <Icon name="gavel" size={24} color="#0d6efd" />}
        />
        <Card.Content>
          <Text style={styles.termsText}>
            {TERMS_AND_CONDITIONS}
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          icon="close"
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={saveInvoice}
          style={styles.saveButton}
          icon="content-save"
        >
          Save Invoice
        </Button>
        <Button
          mode="contained"
          onPress={shareInvoice}
          style={styles.shareButton}
          icon="share"
        >
          Share
        </Button>
      </View>
    </ScrollView>
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
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  itemInput: {
    marginBottom: 8,
  },
  quantityInput: {
    width: 80,
    marginRight: 8,
  },
  priceInput: {
    width: 100,
    marginRight: 8,
  },
  totalContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalsLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalsValue: {
    fontSize: 16,
    color: '#333',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#0d6efd',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  taxInput: {
    width: 100,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 30,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
});

export default InvoiceScreen;
