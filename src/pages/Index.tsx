import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { AddMemberForm } from '@/components/AddMemberForm';
import { EventCalendar } from '@/components/EventCalendar';
import { Admins, apiService, ApiResponse } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [username, setUserName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // interface ApiResponse<T> {
  //   success: boolean;
  //   message?: string;
  //   data?: T[];
  // }

  // interface Admins {
  //   id: number;
  //   username: string;
  //   created_at: string;
  //   is_verified: boolean;
  //   role: string;
  // }


  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (token != null) {
        try {
          const response = await apiService.validateToken(token);
          if (response) {
            setUserName(response.username || null);
            setCurrentPage('dashboard');
          } else {
            localStorage.removeItem('authToken');
            setCurrentPage('login');
            toast({
              title: "Session Expired",
              description: "Invalid token response. Please log in again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('authToken');
          setCurrentPage('login');
          toast({
            title: "Session Expired",
            description: (error as Error).message || "Please log in again.",
            variant: "destructive",
          });
        }
      } else {
        setCurrentPage('login');
        toast({
          title: "No Session Found",
          description: "Please log in to continue.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [toast]);


  const handleRegister = async (name: string, mobile: string, role: string) => {
    try {
      const { user } = await apiService.registerUser(name, mobile, role);
      console.log("Registered user:", user);
      setCurrentPage('login');
      toast({
        title: "Success",
        description: "Registration successful. Please log in.",
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    }

  };

  const handleSendOtp = async (mobile: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiService.login(mobile);
      if (!response) {
        return { success: false, message: "No response from server" };
      }
      return { success: response.success, message: response.message || "OTP sent" };
    } catch (error: unknown) {
      console.error("Send OTP failed:", error);
      if (error instanceof Error) {
        return {
          success: false,
          message:
            error.message === "User not found"
              ? "User not found. Please register."
              : "Failed to send OTP",
        };
      }
      return { success: false, message: "Failed to send OTP" };
    }
  };

  const handleVerifyOtp = async (mobile: string, otp: string): Promise<ApiResponse<Admins>> => {
    try {
      const response = await apiService.validateOtp(mobile, otp);
      // console.log("handleVerifyOtp response:", response);

      if (!response.success || !response.user || !response.token) {
        return {
          success: false,
          message: "Invalid login response. Missing user or token. Please try again.",
        };
      }

      // Store token in localStorage
      localStorage.setItem("authToken", response.token);

      return {
        success: true,
        message: "Login successful",
        data: [response.user] as Admins[],
      };
    } catch (error: unknown) {
      console.error("Verify OTP failed:", error);
      if (error instanceof Error) {
        return {
          success: false,
          message:
            error.message.includes("User not found")
              ? "User not found. Please register."
              : error.message.includes("Invalid OTP")
                ? "Invalid OTP. Please try again."
                : error.message.includes("OTP has expired")
                  ? "OTP has expired. Please request a new one."
                  : "Verification failed",
        };
      }
      return { success: false, message: "Verification failed" };
    }
  };



  const handleLogout = async () => {
    try {
      // await apiService.logout();
      localStorage.removeItem('authToken');
      setUserName(null);
      setCurrentPage('login');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMemberAdded = () => {
    // Optionally, you can show a success message or perform other actions
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
    return currentPage === 'register' ? (
      <RegisterForm
        onRegister={
          handleRegister
        }
        onSwitchToLogin={() => setCurrentPage('login')}
      />
    ) : (
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