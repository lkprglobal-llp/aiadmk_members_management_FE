import { useState } from "react";
import { LogIn, Phone, Contact, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface RegisterFormProps {
  onRegister: (name: string, mobile: string, role: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUserName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //validations
    if (!username) {
      toast({
        title: "Error",
        description: "please enter your name",
        variant: "destructive",
      });
      return;
    }
    if (!mobile) {
      toast({
        title: "Error",
        description: "please enter your mobile number",
        variant: "destructive",
      });
      return;
    }
    if (!role) {
      toast({
        title: "Error",
        description: "please select a role",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(username, mobile, role);
      if (username != null && mobile != null) {
        onSwitchToLogin();
      }
      toast({
        title: "Success",
        description: "Registration successful!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      console.log("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder: In a real app, this should be passed as a prop or handled via context/router.
  // function setCurrentPage(page: string): void {
  //   // For demonstration, just show a toast.
  //   toast({
  //     title: "Navigation",
  //     description: `Would navigate to "${page}" page.`,
  //   });
  //   // In a real app, you would use a router to navigate.
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md p-6 animate-fade-in">
        <Card className="card-gradient border-0 shadow-[var(--shadow-primary)]">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center animate-glow">
              <span className="text-3xl font-bold text-primary-foreground">
                <img src="../../public/images/aiadmk_logo.png" alt="AIADMK Logo" />
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              AIADMK Admin Portal
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Register for access the party management system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <div className="relative">
                  <Contact className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select value={role} onValueChange={(value) => setRole(value)}>
                    <SelectTrigger className="pl-10 h-12 w-full text-left">
                      <SelectValue className="text-muted-foreground" placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 btn-hero text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-primary underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

