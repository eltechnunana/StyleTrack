import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Measurement, Order, Report, Invoice } from '../types';

const STORAGE_KEYS = {
  CLIENTS: '@styletrack:clients',
  MEASUREMENTS: '@styletrack:measurements',
  ORDERS: '@styletrack:orders',
  REPORTS: '@styletrack:reports',
  SETTINGS: '@styletrack:settings',
  INVOICES: '@styletrack:invoices',
};

export class DataService {
  // Clients
  static async getClients(): Promise<Client[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  }

  static async saveClient(client: Client): Promise<void> {
    try {
      const clients = await this.getClients();
      const existingIndex = clients.findIndex(c => c.id === client.id);
      
      if (existingIndex >= 0) {
        clients[existingIndex] = client;
      } else {
        clients.push(client);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving client:', error);
    }
  }

  static async deleteClient(clientId: string): Promise<void> {
    try {
      const clients = await this.getClients();
      const filteredClients = clients.filter(c => c.id !== clientId);
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filteredClients));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  }

  // Measurements
  static async getMeasurements(): Promise<Measurement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting measurements:', error);
      return [];
    }
  }

  static async saveMeasurement(measurement: Measurement): Promise<void> {
    try {
      const measurements = await this.getMeasurements();
      const existingIndex = measurements.findIndex(m => m.id === measurement.id);
      
      if (existingIndex >= 0) {
        measurements[existingIndex] = measurement;
      } else {
        measurements.push(measurement);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  }

  static async getMeasurementsByClient(clientId: string): Promise<Measurement[]> {
    try {
      const measurements = await this.getMeasurements();
      return measurements.filter(m => m.clientId === clientId);
    } catch (error) {
      console.error('Error getting measurements by client:', error);
      return [];
    }
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  static async saveOrder(order: Order): Promise<void> {
    try {
      const orders = await this.getOrders();
      const existingIndex = orders.findIndex(o => o.id === order.id);
      
      if (existingIndex >= 0) {
        orders[existingIndex] = order;
      } else {
        orders.push(order);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }

  // Reports
  static async getReports(): Promise<Report[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  static async saveReport(report: Report): Promise<void> {
    try {
      const reports = await this.getReports();
      reports.push(report);
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }

  // Invoices
  static async getInvoices(): Promise<Invoice[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INVOICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  }

  static async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      const invoices = await this.getInvoices();
      const existingIndex = invoices.findIndex(i => i.id === invoice.id);
      
      if (existingIndex >= 0) {
        invoices[existingIndex] = invoice;
      } else {
        invoices.push(invoice);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  }

  static async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      const invoices = await this.getInvoices();
      const filteredInvoices = invoices.filter(i => i.id !== invoiceId);
      await AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filteredInvoices));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }

  // Settings
  static async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        defaultUnit: 'cm',
        currency: 'USD',
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        companyInfo: {
          name: 'StyleTrack Tailoring Services',
          phone: '+1 (555) 123-4567',
          email: 'info@styletrack.com',
          address: '123 Fashion Avenue, Style City, SC 12345',
          website: 'www.styletrack.com',
        },
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  static async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}