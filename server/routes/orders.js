const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders with optional filtering
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Apply filters if they exist in the query
    if (req.query.invoiceNo) {
      filters.invoiceNo = req.query.invoiceNo;
    }
    
    if (req.query.customerName) {
      filters.$text = { $search: req.query.customerName };
    }
    
    if (req.query.contactNo) {
      filters.contactNo = req.query.contactNo;
    }
    
    if (req.query.product) {
      filters['items.product'] = { $regex: req.query.product, $options: 'i' };
    }
    
    if (req.query.startDate && req.query.endDate) {
      filters.serviceDate = {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      };
    }
    
    const orders = await Order.find(filters).sort({ serviceDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders within date range for reports
router.get('/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const orders = await Order.find({
      serviceDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ serviceDate: 1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
});

// Update an existing order
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;