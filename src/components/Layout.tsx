import { useState } from 'react';
import { Users, Calendar, Plus, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function Layout({ children, currentPage, onPageChange, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: Plus },
    { id: 'calendar', label: 'Events', icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col mx-auto bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-900 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  <img src='../../public/aiadmk_logo.png' alt='AIADMK Logo' className="w-6 h-6" />
                </span>
              </div>
              <div>
                <h1 className="text-primary-foreground font-bold text-xl">AIADMK</h1>
                <p className="text-primary-foreground/80 text-sm">Party Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-foreground text-primary shadow-md'
                        : 'text-primary-foreground hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="hidden md:flex items-center space-x-2 border-none text-white bg-transparent hover:bg-white hover:text-primary"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-primary-foreground"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/20">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 w-full px-4 py-3 rounded-lg border-none text-white bg-transparent hover:bg-white hover:text-primary"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container flex-1 mx-auto px-4 py-6">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-600 to-teal-900 text-secondary-foreground sticky bottom-0 inset-x-0 py-5 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Copyrights &copy; {new Date().getFullYear()} LKPR Global LLP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}