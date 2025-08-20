import BlobSection from '../components/BlobSection';
import SignInForm from '../components/SignInForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex font-['Montserrat']">
      {/* Left Side - Blob/Orb Section */}
      <BlobSection />
      
      {/* Right Side - Sign In Form */}
      <SignInForm />
    </div>
  );
};

export default LoginPage;
