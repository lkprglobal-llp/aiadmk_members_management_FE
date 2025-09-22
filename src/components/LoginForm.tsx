import { useState } from 'react';
import { LogIn, Lock, Mail, Phone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { on } from 'events';
import { Admins } from '@/services/api';
import aiadmk_logo from '../../public/aiadmk_logo.png';

interface LoginFormProps {
  onLogin: (mobile: string, otp?: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [currentPage, setCurrentPage] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile'); // step control
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile) {
      toast({
        title: "Error",
        description: "please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(mobile, otp);
      toast({
        title: "Success",
        description: "OTP Sent",
      });
      setStep('otp');
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  //Handle OTP submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Step 2: verify OTP
      await onLogin(mobile, otp);
      // setCurrentPage('dashboard')
      toast({
        title: "Success",
        description: "Login successful!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(true);
    }
    setCurrentPage("dashboard")
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md p-6 animate-fade-in">
        <Card className="card-gradient border-0 shadow-[var(--shadow-primary)]">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center animate-glow">
              <span className="text-3xl font-bold text-primary-foreground">
                <img src={aiadmk_logo} alt='AIADMK Logo' />
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              AIADMK Admin Portal
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 'mobile'
                ? "Sign in with your mobile number"
                : "Enter the OTP sent to your mobile"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'mobile' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="xxxxxxxxxx"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 btn-hero text-lg font-semibold"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    OTP
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 btn-hero text-lg font-semibold"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}

            {step === 'mobile' && (
              <div className="mt-6 text-center text-sm">
                <p>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={onSwitchToRegister}
                  >
                    Register
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
