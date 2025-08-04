import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, LogOut, Menu, X, Package, ClipboardList, PlusCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import useAuthStore from '@/store/auth-store';
import logo from '@/assets/logo.png'; // Add this import

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-2 mt-8">
      <Button 
        variant="ghost" 
        className="justify-start gap-2" 
        onClick={() => navigate('/')}
      >
        <ClipboardList size={20} />
        Orders List
      </Button>
      <Button 
        variant="ghost" 
        className="justify-start gap-2" 
        onClick={() => navigate('/new-order')}
      >
        <PlusCircle size={20} />
        New Order
      </Button>
      <Button 
        variant="ghost" 
        className="justify-start gap-2" 
        onClick={() => navigate('/reports')}
      >
        <FileText size={20} />
        Reports
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          {/* Replace <Flame /> with your logo or show both */}
          <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-lg font-bold">Rajarata Fire Service</h1>
        </div>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Flame size={20} className="text-primary" />
                    <span className="font-semibold">Rajarata Fire</span>
                  </div>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X size={18} />
                    </Button>
                  </SheetTrigger>
                </div>
                
                <NavLinks />
                
                <div className="mt-auto pb-4">
                  <div className="px-4 py-2 text-sm">
                    <p className="font-medium">Logged in as: {user?.username}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 mt-2" 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.username}</span>
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-1" 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar - Only on desktop */}
        {!isMobile && (
          <aside className="w-64 bg-card border-r p-4">
            <div className="flex items-center gap-2 mb-6">
              <Package className="text-primary" size={20} />
              <h2 className="font-semibold">Order Management</h2>
            </div>
            
            <NavLinks />

            <div className="mt-auto pt-4 border-t mt-8">
              <div className="text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} Rajarata Fire Service</p>
                <p className="text-xs mt-1">Order Management System</p>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto bg-secondary/20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;