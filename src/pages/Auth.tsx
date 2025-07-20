
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import apoorvLogo from "@/assets/apoorv-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle, resetPassword, user } = useAuth();
  const [step, setStep] = useState<'method' | 'email' | 'forgot-password'>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotSuggestion, setShowForgotSuggestion] = useState(false);

  // Redirect if already authenticated
  if (user) {
    navigate('/home');
    return null;
  }

  const handleEmailAuth = async () => {
    if (email && password) {
      setLoading(true);
      setShowForgotSuggestion(false);
      
      // First try to sign in
      const { error: signInError } = await signIn(email, password);
      
      if (!signInError) {
        // Sign in successful
        navigate('/onboarding');
        return;
      }
      
      // If sign in failed, try to sign up
      if (password.length >= 6) {
        const { error: signUpError, userExists } = await signUp(email, password);
        
        if (userExists) {
          // User exists but wrong password, show forgot password
          setShowForgotSuggestion(true);
        } else if (!signUpError) {
          // Sign up successful
          // User will need to verify email before they can login
        }
      }
      
      setLoading(false);
      
      // If both failed and it's not a user exists case, show forgot password
      if (signInError && !showForgotSuggestion) {
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

  const handleGoogleAuth = async () => {
    setLoading(true);
    await signInWithGoogle();
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
        <h1 className="text-xl font-semibold text-foreground ml-4">Get Started</h1>
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
              <CardTitle>Choose Authentication Method</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to your account or create a new one
              </p>
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
                onClick={handleGoogleAuth}
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
            </CardContent>
          </Card>
        )}

        {step === 'email' && (
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle>Email Authentication</CardTitle>
              <p className="text-sm text-muted-foreground">
                We'll sign you in or create an account automatically
              </p>
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
                  placeholder="Enter your password (min 6 characters)"
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
                onClick={handleEmailAuth}
                disabled={!email || password.length < 6 || loading}
                className="w-full h-12 bg-gradient-medical"
                size="lg"
              >
                {loading ? "Authenticating..." : "Continue"}
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
                <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-md">
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
              <p className="text-sm text-muted-foreground">
                Enter your email to receive reset instructions
              </p>
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
                  Back to Authentication
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
