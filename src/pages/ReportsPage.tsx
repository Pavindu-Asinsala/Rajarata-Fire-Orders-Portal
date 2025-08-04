import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Search, FileSpreadsheet, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore, isEqual } from 'date-fns';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Order } from '@/lib/types';
import { ordersApi } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

// Extend jsPDF with autotable types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ReportsPage = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDateValid, setIsDateValid] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Order-Report',
    onAfterPrint: () => {
      toast({
        title: "Print Success",
        description: "The report was sent to the printer",
      });
    },
  });

  const validateDateRange = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Date Required",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return false;
    }

    if (isAfter(startDate, endDate)) {
      setIsDateValid(false);
      toast({
        title: "Invalid Date Range",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return false;
    }

    setIsDateValid(true);
    return true;
  };

  const searchOrders = async () => {
    if (!validateDateRange()) return;
    
    setLoading(true);
    try {
      // Call the API to get orders by date range
      const data = await ordersApi.getOrdersByDateRange(
        format(startDate!, 'yyyy-MM-dd'),
        format(endDate!, 'yyyy-MM-dd')
      );
      setOrders(data);
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

  const exportToPDF = () => {
    if (!orders.length) {
      toast({
        title: "No Data",
        description: "There are no orders to export",
        variant: "destructive",
      });
      return;
    }
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Rajarata Fire Service - Order Report", 14, 22);
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Period: ${format(startDate!, 'PPP')} to ${format(endDate!, 'PPP')}`, 14, 30);
    
    // Add report generation info
    const today = new Date();
    doc.setFontSize(9);
    doc.text(`Report generated: ${format(today, 'PPP, h:mm a')}`, 14, 36);
    
    // Create table data
    const tableData = orders.map(order => [
      order.invoiceNo || '-',
      order.customerName,
      order.serviceDate,
      order.status,
      `Rs. ${order.totalAmount.toLocaleString()}`
    ]);
    
    // Calculate total
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Add table
    doc.autoTable({
      head: [['Invoice No', 'Customer', 'Service Date', 'Status', 'Amount']],
      body: tableData,
      startY: 45,
      foot: [['', '', '', 'Total Amount', `Rs. ${totalAmount.toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    
    // Save PDF
    doc.save(`order-report-${format(today, 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "Export Success",
      description: "The report has been exported to PDF",
    });
  };

  const exportToExcel = () => {
    // In a real app, this would generate an Excel file
    // For this example, we'll just show a toast
    toast({
      title: "Excel Export",
      description: "Excel export functionality would be implemented here",
    });
  };

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

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
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Reports</CardTitle>
            <CardDescription>
              Generate reports for orders within a specific date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                        !isDateValid && "border-destructive"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                        !isDateValid && "border-destructive"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={searchOrders} 
                  className="gap-2"
                  disabled={loading}
                >
                  <Search className="h-4 w-4" />
                  {loading ? "Searching..." : "Search Orders"}
                </Button>
              </div>
            </div>
            
            {orders.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    Orders from {format(startDate!, 'MMM d, yyyy')} to {format(endDate!, 'MMM d, yyyy')}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={exportToPDF}
                    >
                      <FileText className="h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={exportToExcel}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handlePrint}
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
                
                <div ref={printRef} className="rounded-md border overflow-hidden">
                  <div className="p-4 bg-card hidden print:block">
                    <h2 className="text-xl font-bold">Rajarata Fire Service - Order Report</h2>
                    <p className="text-sm text-muted-foreground">
                      Period: {format(startDate!, 'MMM d, yyyy')} to {format(endDate!, 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow 
                          key={order._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/order/${order._id}`)}
                        >
                          <TableCell className="font-medium">{order.invoiceNo || '-'}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
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
                          <TableCell className="text-right">Rs. {order.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      
                      <TableRow className="border-t-2">
                        <TableCell colSpan={4} className="font-bold text-right">
                          Total:
                        </TableCell>
                        <TableCell className="font-bold text-right">
                          Rs. {totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <div className="p-4 bg-card text-sm text-muted-foreground text-right hidden print:block">
                    <p>Report generated: {format(new Date(), 'PPP, h:mm a')}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Orders Found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {startDate && endDate 
                    ? "No orders were found in the selected date range. Try selecting a different period."
                    : "Select a date range above to generate a report."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;