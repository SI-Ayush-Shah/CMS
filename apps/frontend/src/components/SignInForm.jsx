import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
      {/* Sign In Card */}
      <div className="backdrop-blur-[50px] bg-black/70 rounded-[20px] p-12 w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <h1 className="font-['Montserrat'] font-semibold text-2xl text-white text-center">
            Sign In
          </h1>
          <p className="font-['Montserrat'] font-normal text-sm text-[#747474]">
            Your Social Accounts
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-8">
          <Button
            onClick={handleGoogleSignIn}
            variant="dark-secondary"
            className="w-full h-10"
            leftIcon={
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
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
            }
          >
            <span className="text-sm">Sign in with Google</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-[15px] mb-8">
          <div className="flex-1 h-px bg-[#747474]"></div>
          <span className="font-['Montserrat'] font-normal text-sm text-[#747474]">
            Or with Email
          </span>
          <div className="flex-1 h-px bg-[#747474]"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="dark"
              className="text-sm"
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="dark"
              className="text-sm"
            />
          </div>

          <div className="text-right mb-6">
            <button
              variant="link"
              className="font-['Montserrat'] font-medium text-sm text-[#8c53c3] hover:text-[#b588e0] bg-transparent p-0 h-auto"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            variant="dark"
            className="w-full rounded-[10px] text-base"
            isLoading={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="font-['Montserrat'] font-medium text-sm">
            <span className="text-[#747474]">Not a Member yet?</span>
            <Button
              variant="link"
              className="font-['Montserrat'] font-medium text-sm text-[#8c53c3] hover:text-[#b588e0] bg-transparent p-0 h-auto ml-1"
            >
              Sign Up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
