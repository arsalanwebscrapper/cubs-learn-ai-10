import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Lock } from "lucide-react";
import cubsMascot from "@/assets/cubs-mascot.png";

const StudentLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('authenticate_student', {
        p_username: username.trim(),
        p_password: password
      });

      if (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Error",
          description: "Login failed. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const result = data as any;
      if (result && result.success) {
        // Store student session in localStorage
        localStorage.setItem('student_session', JSON.stringify(result.student));
        
        toast({
          title: "Success",
          description: `Welcome, ${result.student.full_name}!`
        });
        
        // Redirect to student dashboard
        window.location.href = '/student-dashboard';
      } else {
        toast({
          title: "Login Failed",
          description: result?.message || "Invalid username or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={cubsMascot} alt="StudyCubs" className="w-12 h-12" />
            <span className="text-2xl font-batangas font-bold text-primary">StudyCubs</span>
          </div>
          <CardTitle className="text-2xl font-batangas">Student Login</CardTitle>
          <CardDescription>Enter your username and password to access your assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading} variant="cubs">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button variant="link" asChild>
              <a href="/">← Back to Home </a>
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need login credentials? Contact your teacher.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
