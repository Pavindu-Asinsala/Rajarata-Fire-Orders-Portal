// Types for the entire application

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface Product {
  name: string;
  price: number;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  _id?: string;
  invoiceNo?: string;
  customerName: string;
  address: string;
  contactNo: string;
  serviceDate: string;
  insertDate: string;
  status: 'New' | 'Refilling';
  items: OrderItem[];
  totalAmount: number;
}

// Auth store types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}