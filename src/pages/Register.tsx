import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Eye, EyeOff, MessageCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import apoorvLogo from "@/assets/apoorv-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, setAuth } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'method' | 'email' | 'phone'>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    navigate('/home');
    return null;
  }

  const handleSendOtp = async () => {
    if (phone.length >= 10) {
      setLoading(true);
      try {
        const { error } = await supabase.functions.invoke('send-whatsapp-otp', {
          body: { phone },
        });
        if (error) throw error;
        toast({ title: "OTP Sent", description: "Check your WhatsApp for the code." });
        setStep('phone'); // Stay on phone step to enter OTP
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast({ title: "Error", description: "Failed to send OTP. Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
          body: { phone, code: otp },
        });

        if (error) throw error;
        if (!data.token) throw new Error("Authentication failed, no token returned.");

        // Manually sign in the user with the custom token
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: data.token,
            refresh_token: 'dummy-refresh-token' // A dummy refresh token is needed
        });
        
        if (sessionError) throw sessionError;

        // Update auth context
        setAuth(sessionData.user, sessionData.session);

        toast({ title: "Success", description: "You are now signed in." });
        navigate('/onboarding');

      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast({ title: "Error", description: error.message || "Failed to verify OTP.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmailSubmit = async () => {
    if (email && password.length >= 6) {
      setLoading(true);
      const { error, userExists } = await signUp(email, password);
      setLoading(false);
      
      if (userExists) {
        navigate('/signin', { state: { email, password, fromRegister: true } });
      } else if (!error) {
        // User will need to verify email
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  const renderMethodStep = () => (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Choose Sign Up Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => setStep('email')} className="w-full h-12 bg-gradient-medical" size="lg">
          <Mail className="w-5 h-5 mr-2" />
          Continue with Email
        </Button>
        <Button onClick={() => setStep('phone')} className="w-full h-12" variant="outline" size="lg">
          <Phone className="w-5 h-5 mr-2" />
          Continue with Phone
        </Button>
        <Button variant="outline" className="w-full h-12" size="lg" onClick={handleGoogleSignUp} disabled={loading}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );

  const renderPhoneStep = () => (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Sign Up with Phone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-lg"
          />
        </div>
        <Button onClick={handleSendOtp} disabled={phone.length < 10 || loading} className="w-full h-12 bg-gradient-medical" size="lg">
          {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
        </Button>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-lg"
            maxLength={6}
          />
        </div>
        <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading} className="w-full h-12" size="lg">
          {loading ? "Verifying..." : "Verify & Sign Up"}
        </Button>
      </CardContent>
    </Card>
  );

  const renderEmailStep = () => (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-lg"
          />
        </div>
        <div className="space-y-2 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-lg pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button onClick={handleEmailSubmit} disabled={!email || password.length < 6 || loading} className="w-full h-12 bg-gradient-medical" size="lg">
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/signin')}>
              Sign in
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col px-6 py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step === 'method' ? navigate('/') : setStep('method')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground ml-4">Create Account</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8">
          <img
            src={apoorvLogo}
            alt="Apoorv Pathology Lab"
            className="w-20 h-20 object-contain"
          />
        </div>

        {step === 'method' && renderMethodStep()}
        {step === 'email' && renderEmailStep()}
        {step === 'phone' && renderPhoneStep()}
      </div>
    </div>
  );
};

export default Register;