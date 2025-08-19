import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { FaGoogle } from "react-icons/fa";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Handle successful login here
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google Sign In
    console.log("Google Sign In clicked");
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
          <p className="font-['Montserrat'] font-normal text-sm text-invert-low">
            Your Social Accounts
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-8">
          <button className="w-full flex items-center justify-center gap-2 h-10 bg-button-filled-main-default text-white rounded-lg text-[14px] font-normal cursor-pointer">
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.8055 10.5415H21V10.5H12V14.5H17.6515C16.827 16.8285 14.6115 18.5 12 18.5C8.6865 18.5 6 15.8135 6 12.5C6 9.1865 8.6865 6.5 12 6.5C13.5295 6.5 14.921 7.077 15.9805 8.0195L18.809 5.191C17.023 3.5265 14.634 2.5 12 2.5C6.4775 2.5 2 6.9775 2 12.5C2 18.0225 6.4775 22.5 12 22.5C17.5225 22.5 22 18.0225 22 12.5C22 11.8295 21.931 11.175 21.8055 10.5415Z"
                fill="#FFC107"
              />
              <path
                d="M3.15308 7.8455L6.43858 10.255C7.32758 8.054 9.48058 6.5 12.0001 6.5C13.5296 6.5 14.9211 7.077 15.9806 8.0195L18.8091 5.191C17.0231 3.5265 14.6341 2.5 12.0001 2.5C8.15908 2.5 4.82808 4.6685 3.15308 7.8455Z"
                fill="#FF3D00"
              />
              <path
                d="M11.9999 22.5C14.5829 22.5 16.9299 21.5115 18.7044 19.904L15.6094 17.285C14.5719 18.0745 13.3037 18.5014 11.9999 18.5C9.39891 18.5 7.19041 16.8415 6.35841 14.527L3.09741 17.0395C4.75241 20.278 8.11341 22.5 11.9999 22.5Z"
                fill="#4CAF50"
              />
              <path
                d="M21.8055 10.5415H21V10.5H12V14.5H17.6515C17.2571 15.6082 16.5467 16.5766 15.608 17.2855L15.6095 17.2845L18.7045 19.9035C18.4855 20.1025 22 17.5 22 12.5C22 11.8295 21.931 11.175 21.8055 10.5415Z"
                fill="#1976D2"
              />
            </svg>
            Sign with Google Account
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-[15px] mb-8">
          <div className="flex-1 h-px bg-invert-low"></div>
          <span className="font-['Montserrat'] font-normal text-sm text-invert-low">
            Or with Email
          </span>
          <div className="flex-1 h-px bg-invert-low"></div>
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
              className="font-['Montserrat'] font-medium text-sm text-core-prim-300 hover:text-core-prim-100 bg-transparent p-0 h-auto"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            variant="solid"
            className="w-full rounded-[10px] text-base"
            isLoading={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Sign Up Link */}
        {/* <div className="text-center mt-8">
          <p className="font-['Montserrat'] font-medium text-sm">
            <span className="text-invert-low">Not a Member yet?</span>
            <Button
              variant="link"
              className="font-['Montserrat'] font-medium text-sm text-core-prim-300 hover:text-core-prim-100 bg-transparent p-0 h-auto ml-1"
            >
              Sign Up
            </Button>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default SignInForm;
