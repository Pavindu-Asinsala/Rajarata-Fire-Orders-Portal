import axios from 'axios';
import { Order } from './types';

// We'll set up a base API client
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Orders API
export const ordersApi = {
  // Get all orders with optional filters
  getOrders: async (params?: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  // Get single order by ID
  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // Create new order
  createOrder: async (order: Order) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  
  // Update existing order
  updateOrder: async (id: string, order: Order) => {
    const response = await api.put(`/orders/${id}`, order);
    return response.data;
  },
  
  // Delete order
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get(`/orders/reports`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

// This would be used in a real implementation with MongoDB
// For now, we'll use this predefined list of products
export const PRODUCT_LIST = [
  '09 Ltrs Water Fire Extinguishers',
  '09 Ltrs Foam Fire Extinguishers',
  '09 Kg Dry Powder Fire Extinguishers',
  '06 Kg Dry Powder Fire Extinguishers',
  '05 Kg Dry Powder Fire Extinguishers',
  '05 Kg CO₂ Fire Extinguishers',
  '03 Kg CO₂ Fire Extinguishers',
  '02 Kg CO₂ Fire Extinguishers',
  '100 Ltr water/Foam/Fire Extinguishers',
  '25 kg Dry Powder/CO₂/Fire Extinguishers',
  'Water/Foam/DCP Head',
  'Water/Foam/DCP Gauges',
  'Water/Foam/DCP Discharge Hose',
  '05 kg Complete Hose',
  '02 kg/03 Kg Complete Hose',
  '05kg, 03kg, 02kg Carbon Dioxide Head',
  '1KG Dry Powder',
  'Fire Blanket'
];