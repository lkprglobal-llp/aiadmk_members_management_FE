import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { AddMemberForm } from '@/components/AddMemberForm';
import { EventCalendar } from '@/components/EventCalendar';
import { apiService, User } from '@/services/api';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd validate the token with your backend
      setUser({ id: 1, username: 'admin', email: 'admin@aiadmk.com', role: 'admin' });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const { user } = await apiService.login(email, password);
    setUser(user);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleMemberAdded = () => {
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'add-member':
        return (
          <AddMemberForm 
            onBack={() => setCurrentPage('dashboard')} 
            onMemberAdded={handleMemberAdded}
          />
        );
      case 'calendar':
        return <EventCalendar onBack={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <Dashboard 
            onAddMember={() => setCurrentPage('add-member')}
            onViewCalendar={() => setCurrentPage('calendar')}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
