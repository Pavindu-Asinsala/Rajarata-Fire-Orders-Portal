import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  PlusCircle, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Check, 
  X
} from 'lucide-react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ordersApi, PRODUCT_LIST } from '@/lib/api';
import { Order, OrderItem } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';

// Define the form schema using zod
const formSchema = z.object({
  invoiceNo: z.string().optional(),
  customerName: z.string().min(1, { message: 'Customer name is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  contactNo: z.string().optional(), // <-- Make contact number optional
  serviceDate: z.date({ required_error: 'Service date is required' }),
  status: z.enum(['New', 'Refilling']),
  items: z.array(
    z.object({
      product: z.string().min(1, { message: 'Product is required' }),
      quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
      unitPrice: z.number().min(0, { message: 'Unit price must be at least 0' }),
      total: z.number(),
    })
  ).min(1, { message: 'At least one item is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const NewOrderPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNo: '',
      customerName: '',
      address: '',
      contactNo: '',
      serviceDate: new Date(),
      status: 'New',
      items: [
        {
          product: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    },
  });

  // Calculate totals when items change
  const items = form.watch('items');
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const orderData: Order = {
        customerName: data.customerName,
        address: data.address,
        contactNo: data.contactNo,
        status: data.status,
        items: data.items.map(item => ({
          product: item.product || '',  // Ensure non-optional
          quantity: item.quantity || 0, // Ensure non-optional
          unitPrice: item.unitPrice || 0, // Ensure non-optional
          total: item.total || 0 // Ensure non-optional
        })),
        serviceDate: format(data.serviceDate, 'yyyy-MM-dd'),
        insertDate: format(new Date(), 'yyyy-MM-dd'),
        totalAmount,
        invoiceNo: data.invoiceNo,
      };

      if (editId) {
        await ordersApi.updateOrder(editId, orderData);
        toast({
          title: 'Order Updated',
          description: 'The order has been successfully updated',
        });
      } else {
        await ordersApi.createOrder(orderData);
        toast({
          title: 'Order Created',
          description: 'The order has been successfully created',
        });
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load order data for editing
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!editId) return;
      
      setIsLoading(true);
      try {
        // Fetch order from API
        const order = await ordersApi.getOrder(editId);

        // Parse date string to Date object
        const serviceDate = new Date(order.serviceDate);

        // Reset form with order data
        form.reset({
          ...order,
          serviceDate,
          items: order.items.map(item => ({
            product: item.product || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            total: item.total || 0,
          })),
        });

      } catch (error) {
        console.error('Error fetching order data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [editId, form]);

  // Add a new item to the order
  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      {
        product: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  // Remove an item from the order
  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
    } else {
      toast({
        title: 'Cannot Remove',
        description: 'Order must have at least one item',
      });
    }
  };

  // Update item total when quantity or unit price changes
  const updateItemTotal = (index: number) => {
    const items = form.getValues('items');
    const quantity = items[index].quantity || 0;
    const unitPrice = items[index].unitPrice || 0;
    const total = quantity * unitPrice;
    
    form.setValue(`items.${index}.total`, total);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {editId ? 'Edit Order' : 'New Order'}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{editId ? 'Edit Order' : 'New Order'}</CardTitle>
                <CardDescription>
                  {editId 
                    ? 'Update the order details below'
                    : 'Enter the order details below'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="details" className="flex gap-2">
                      {activeTab === 'details' && <Check className="w-4 h-4" />}
                      Customer Details
                    </TabsTrigger>
                    <TabsTrigger value="items" className="flex gap-2">
                      {activeTab === 'items' && <Check className="w-4 h-4" />}
                      Order Items
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Customer Details Tab */}
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="invoiceNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice No (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter invoice number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select order type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Refilling">Refilling</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="serviceDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Service Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-4 text-right">
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('items')}
                        className="gap-2"
                      >
                        Next: Order Items
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Order Items Tab */}
                  <TabsContent value="items" className="space-y-4">
                    <div className="space-y-6">
                      {form.watch('items').map((_, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b pb-4">
                          <div className="md:col-span-5">
                            <Controller
                              control={form.control}
                              name={`items.${index}.product`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product/Service</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {PRODUCT_LIST.map((product) => (
                                        <SelectItem key={product} value={product}>
                                          {product}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="Qty"
                                      {...field}
                                      value={field.value}
                                      onChange={(e) => {
                                        field.onChange(parseInt(e.target.value) || 0);
                                        updateItemTotal(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Unit Price</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="Price"
                                      {...field}
                                      value={field.value}
                                      onChange={(e) => {
                                        field.onChange(parseInt(e.target.value) || 0);
                                        updateItemTotal(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.total`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Line Total</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      disabled
                                      value={field.value}
                                      className="bg-muted"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="md:col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addItem}
                        className="gap-2 mt-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Product
                      </Button>
                      
                      <div className="flex justify-end mt-6 pt-4 border-t">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Amount</div>
                          <div className="text-2xl font-bold">
                            Rs. {totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting 
                    ? 'Saving...' 
                    : editId 
                      ? 'Update Order' 
                      : 'Save Order'
                  }
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default NewOrderPage;