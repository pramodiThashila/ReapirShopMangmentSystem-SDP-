export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
}

export interface RepairJob {
  id: string;
  customerId: string;
  customerName: string;
  deviceType: string;
  issue: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  startDate: string;
  estimatedCompletion: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}