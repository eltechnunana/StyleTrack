export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female' | 'custom';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measurement {
  id: string;
  clientId: string;
  clientName: string;
  gender: 'male' | 'female' | 'custom';
  height?: number;
  neck?: number;
  shoulder?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  armLength?: number;
  sleeveLength?: number;
  backWidth?: number;
  trouserLength?: number;
  thigh?: number;
  inseam?: number;
  customFields?: { [key: string]: number };
  notes?: string;
  photos?: string[];
  unit: 'cm' | 'inches';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  orderNumber: string;
  description: string;
  measurements?: Measurement;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  price?: number;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  orderId: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  terms?: string;
  companyInfo: CompanyInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
}

export interface Report {
  id: string;
  type: 'monthly' | 'client' | 'financial';
  title: string;
  data: any;
  createdAt: Date;
}