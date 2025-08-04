import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileEdit, Trash2, AlertCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/lib/types';
import { ordersApi } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${order?.invoiceNo || order?._id}`,
    onAfterPrint: () => {
      toast({
        title: "Print Success",
        description: "The invoice was sent to the printer",
      });
    },
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch order from backend API
        const data = await ordersApi.getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      // Call the API to delete the order
      await ordersApi.deleteOrder(id);
      
      toast({
        title: 'Order Deleted',
        description: 'The order has been successfully deleted',
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading order details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <p>Order not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Order Details</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
            
            <Button
              onClick={() => navigate(`/new-order?edit=${id}`)}
              className="gap-2"
            >
              <FileEdit className="h-4 w-4" />
              Edit
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <div ref={printRef} className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-primary">Rajarata Fire Service (PVT) Ltd</h2>
                <p className="text-muted-foreground">Fire Extinguisher Services</p>
                <p className="text-sm mt-2">K 11, Airport Road, Anuradhapura</p>
                <p className="text-sm">Tel: 025-2222333 / 077-7404097 | Email: rajaratafire@gmail.com</p>
              </div>
              <div className="text-right">
                <div className="inline-block border border-border p-4 rounded-lg">
                  <p className="font-medium">Invoice No:</p>
                  <p className="text-lg font-semibold">{order.invoiceNo || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mt-2">Service Date: {order.serviceDate}</p>
                  <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium inline-block 
                    bg-primary/10 text-primary">
                    {order.status}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-1">Customer Details:</h3>
                <p className="font-semibold text-lg">{order.customerName}</p>
                <p>{order.address}</p>
                <p>Contact: {order.contactNo}</p>
              </div>
              <div className="text-right">
                <h3 className="font-medium mb-1">Order Info:</h3>
                <p>Date: {order.serviceDate}</p>
                <p>Order ID: {order._id}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="p-2 text-left font-medium">Product/Service</th>
                      <th className="p-2 text-center font-medium">Quantity</th>
                      <th className="p-2 text-right font-medium">Unit Price</th>
                      <th className="p-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2">{item.product}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">Rs. {item.unitPrice.toLocaleString()}</td>
                        <td className="p-2 text-right font-medium">Rs. {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50">
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-semibold">Total Amount:</td>
                      <td className="p-2 text-right font-bold">Rs. {order.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Payment Terms</p>
                  <p className="text-sm">Payment due within 30 days</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Notes</p>
                  <p className="text-sm">Thank you for your business!</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm font-medium">Customer Signature</p>
                  <div className="h-10 border-b border-dotted mt-6"></div>
                </div>
              </div>
            </div>
          </div>
          
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-muted-foreground">
              For inquiries about this invoice, please contact us at 025-2222333
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Yes, Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default OrderDetailPage;