const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contactNo: {
    type: String,
    required: false,
    trim: true
  },
  serviceDate: {
    type: String, // Changed from String to Date
    required: true
  },
  insertDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Refilling'],
    default: 'New'
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better search performance
OrderSchema.index({ customerName: 'text' });
OrderSchema.index({ invoiceNo: 1 });
OrderSchema.index({ serviceDate: 1 });
OrderSchema.index({ contactNo: 1 });

module.exports = mongoose.model('Order', OrderSchema);