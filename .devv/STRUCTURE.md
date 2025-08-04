# This file is only for editing file nodes, do not break the structure

## Project Description
A web-based internal system for Rajarata Fire Service (PVT) Ltd to manage fire extinguisher product orders and services. This application helps the company log, search, filter, and manage orders efficiently.

## Key Features
- Admin login system with authentication for secure access
- Comprehensive order entry form with product selection and price calculation
- Order management with view, edit, and delete functionality
- Detailed invoice generation and printing
- Date range reporting with export options

/src
├── assets/          # Static resources directory, storing static files like images and fonts
│
├── components/      # Components directory
│   ├── layout/     # Layout components like AppLayout
│   │   └── AppLayout.tsx # Main application layout with header and navigation
│   ├── ProtectedRoute.tsx # Route protection component for authentication
│   ├── ui/         # Pre-installed shadcn/ui components, avoid modifying or rewriting unless necessary
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Pre-installed mobile detection Hook from shadcn (import { useIsMobile } from '@/hooks/use-mobile')
│   └── use-toast.ts  # Toast notification system hook for displaying toast messages (import { useToast } from '@/hooks/use-toast')
│
├── lib/            # Utility library directory
│   ├── api.ts     # API service for connecting to the backend
│   ├── types.ts   # TypeScript type definitions for the application
│   └── utils.ts   # Utility functions, including the cn function for merging Tailwind class names
│
├── pages/          # Page components directory, based on React Router structure
│   ├── HomePage.tsx        # Order list view - the main entry point
│   ├── LoginPage.tsx       # Admin login page
│   ├── NewOrderPage.tsx    # Create/edit order form
│   ├── OrderDetailPage.tsx # Order detail/invoice view
│   ├── ReportsPage.tsx     # Date range reports and exports
│   └── NotFoundPage.tsx    # 404 error page
│
├── store/          # State management
│   └── auth-store.ts # Authentication state using Zustand
│
│
├── App.tsx         # Root component, with React Router routing system configured
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 page handling
│
├── main.tsx        # Entry file, rendering the root component and mounting to the DOM
│
├── index.css       # Global styles file, containing Tailwind configuration and custom styles
│                   # Modified with fire service themed colors
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
                      # Contains theme customization, plugins, and content paths
                      # Includes shadcn/ui theme configuration

/server               # Backend server for MongoDB
├── index.js        # Express server entry point
├── models/         # MongoDB schemas
│   └── Order.js    # Order model schema
├── routes/         # API routes
│   └── orders.js   # Order management endpoints
└── .env.example    # Environment variables template