import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Orb } from '../components/Orb';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle successful login here
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google Sign In
    console.log('Google Sign In clicked');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Orb background */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at center, 
            rgba(20, 6, 33, 1) 0%, 
            rgba(40, 12, 67, 0.95) 30%, 
            rgba(60, 18, 100, 0.9) 60%, 
            rgba(20, 6, 33, 1) 100%)`
        }}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-core-prim-900 via-core-prim-800 to-core-prim-900" />
        
        {/* Orb component */}
        <div className="relative z-10">
          <Orb />
        </div>
        
        {/* Additional background effects */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-core-prim-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-core-prim-400 rounded-full opacity-10 blur-3xl" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-h1 leading-h1 font-bold text-main-high">
              Sign In
            </h1>
            <p className="text-body leading-body text-main-medium">
              Your Social Accounts
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-12 bg-core-neu-800 border-core-neu-700 text-invert-high hover:bg-core-neu-700 flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-main-medium">Or with Email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-core-neu-800 border-core-neu-700 text-invert-high placeholder:text-invert-low"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-core-neu-800 border-core-neu-700 text-invert-high placeholder:text-invert-low"
              />
            </div>

            {/* Remember me checkbox and forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-core-prim-500 border-core-neu-600 rounded focus:ring-core-prim-500 bg-core-neu-800"
                />
                <span className="text-sm text-main-medium">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-core-prim-500 hover:text-core-prim-400 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="solid"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-core-prim-500 hover:bg-core-prim-600"
            >
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-main-medium">Not a Member yet? </span>
            <button className="text-core-prim-500 hover:text-core-prim-400 transition-colors font-medium">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
