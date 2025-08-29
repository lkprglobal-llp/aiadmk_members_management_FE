import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { AddMemberForm } from '@/components/AddMemberForm';
import { EventCalendar } from '@/components/EventCalendar';
import { Admins, apiService, Member } from '@/services/api';
import { set } from 'date-fns';

const Index = () => {
  const [username, setUserName] = useState<Admins | null>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   // In a real app, you'd validate the token with your backend
    //   setUser({ id: 1, username: 'admin', email: 'admin@aiadmk.com', role: 'admin' });
    // }
    setIsLoading(false);
  }, []);


  const handleRegister = async (name: string, mobile: string, role: string) => {
    const { user } = await apiService.registerUser(name, mobile, role);
    if(user.username != null && user.mobile != null)
    {
      setCurrentPage('login');
    }
    setUserName(user);
    
  };

  const handleSendOtp = async (mobile: string) => {
    const response = await apiService.login(mobile); // This should send OTP
    return response; // return success/fail
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (mobile: string, otp: string) => {
    const response = await apiService.validateOtp(mobile, otp);
    console.log("Verify OTP response:", response.user);

    if (!response) {
      return response;
    }
    setUserName(response.user);
    setCurrentPage('dashboard');

  };

  const handleLogout = async () => {
    await apiService.logout();
    setUserName(null);
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

   if (username == null) {
    return currentPage === 'login' ? (
      <LoginForm 
        onLogin={async (mobile: string, otp: string) => {
          if (!otp) {
            await handleSendOtp(mobile); // just send OTP, nothing returned
            return;
          }
          await handleVerifyOtp(mobile, otp); // verify and setUserName inside
        }}
        onSwitchToRegister={() => setCurrentPage('register')}
      />
    ) : (
      <RegisterForm 
        onRegister={
          handleRegister
        }
        onSwitchToLogin={() => setCurrentPage('login')} 
      />
    );
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
