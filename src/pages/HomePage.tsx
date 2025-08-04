import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, FileText, Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';
import { format } from 'date-fns';

function HomePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update fetchOrders to accept filters
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Only filter by date on backend
      const params: any = {};
      if (searchDate) params.serviceDate = format(searchDate, 'yyyy-MM-dd');

      // Fetch all orders (or by date)
      const fetchedOrders = await ordersApi.getOrders(params);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add effect for searchTerm and searchDate
  useEffect(() => {
    fetchOrders();
  }, [searchTerm, searchDate]);

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      // Call the API to delete the order
      await ordersApi.deleteOrder(orderToDelete);
      
      // Update local state
      setOrders(orders.filter(order => order._id !== orderToDelete));
      
      toast({
        title: 'Order Deleted',
        description: 'The order has been successfully deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.invoiceNo && order.invoiceNo.toLowerCase().includes(searchLower)) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      (order.address && order.address.toLowerCase().includes(searchLower)) ||
      (order.contactNo && order.contactNo.toLowerCase().includes(searchLower)) ||
      order.items.some(item => item.product.toLowerCase().includes(searchLower))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Orders List</h1>
          <Button onClick={() => navigate('/new-order')} className="gap-2">
            <PlusCircle size={18} />
            New Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage fire extinguisher orders and services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice, customer, product..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Input
                type="date"
                value={searchDate ? format(searchDate, 'yyyy-MM-dd') : ''}
                onChange={e => setSearchDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-[180px]"
                placeholder="Service Date"
              />
              <Button onClick={fetchOrders} disabled={loading}>
                Search
              </Button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 mb-2 text-muted-foreground" />
                <h3 className="font-medium">No orders found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? 'Try a different search term' : 'Create your first order'}
                </p>
                {!searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4 gap-2"
                    onClick={() => navigate('/new-order')}
                  >
                    <PlusCircle size={16} />
                    Create Order
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead> {/* Add this line */}
                      <TableHead>Service Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.invoiceNo || '-'}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.address}</TableCell> {/* Add this line */}
                        <TableCell>{order.serviceDate}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'New' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>Rs. {order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/order/${order._id}`)}
                              title="View Order"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/new-order?edit=${order._id}`)}
                              title="Edit Order"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(order._id!)}
                              title="Delete Order"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Yes, Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

export default HomePage;