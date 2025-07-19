import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import apoorvLogo from "@/assets/apoorv-logo.png";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, signInWithApple, resetPassword, user } = useAuth();
  const [step, setStep] = useState<'method' | 'email' | 'forgot-password'>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotSuggestion, setShowForgotSuggestion] = useState(false);

  // Handle prefilled data from register page
  useEffect(() => {
    const state = location.state as any;
    if (state?.fromRegister) {
      setEmail(state.email || '');
      setPassword(state.password || '');
      setStep('email');
      // Show message that account exists
      setTimeout(() => {
        alert('Account already exists with this email. Attempting to sign in.');
      }, 100);
    }
  }, [location.state]);

  // Redirect if already authenticated
  if (user) {
    navigate('/home');
    return null;
  }

  const handleEmailSubmit = async () => {
    if (email && password) {
      setLoading(true);
      setShowForgotSuggestion(false);
      const { error } = await signIn(email, password);
      setLoading(false);
      
      if (!error) {
        navigate('/onboarding');
      } else {
        // Show forgot password suggestion on error
        setShowForgotSuggestion(true);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (email) {
      setLoading(true);
      await resetPassword(email);
      setLoading(false);
      setStep('email');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    await signInWithApple();
    setLoading(false);
  };

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
        <h1 className="text-xl font-semibold text-foreground ml-4">Sign In</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8">
          <img 
            src={apoorvLogo} 
            alt="Apoorv Pathology Lab" 
            className="w-20 h-20 object-contain"
          />
        </div>

        {step === 'method' && (
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle>Welcome Back</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setStep('email')}
                className="w-full h-12 bg-gradient-medical"
                size="lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Email
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-12"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-12"
                size="lg"
                onClick={handleAppleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate('/register')}
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'email' && (
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle>Sign In</CardTitle>
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
                  placeholder="Enter your password"
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button
                onClick={handleEmailSubmit}
                disabled={!email || !password || loading}
                className="w-full h-12 bg-gradient-medical"
                size="lg"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => setStep('forgot-password')}
                >
                  Forgot your password?
                </Button>
              </div>

              {showForgotSuggestion && (
                <div className="text-center text-sm text-muted-foreground">
                  Having trouble signing in?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary text-sm"
                    onClick={() => setStep('forgot-password')}
                  >
                    Try resetting your password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'forgot-password' && (
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle>Reset Password</CardTitle>
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
              
              <Button
                onClick={handleForgotPassword}
                disabled={!email || loading}
                className="w-full h-12 bg-gradient-medical"
                size="lg"
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => setStep('email')}
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SignIn;