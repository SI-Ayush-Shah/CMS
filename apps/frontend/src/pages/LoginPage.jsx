import BlobSection from "../components/BlobSection";
import SignInForm from "../components/SignInForm";
import Aurora from "../components/Aurora";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex font-['Montserrat']">
      {/* Left Side - Blob/Orb Section */}
      <BlobSection />
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#3c1264", "#280c43", "#140621"]}
          blend={1}
          amplitude={1}
          speed={0.5}
        />
      </div>
      {/* Right Side - Sign In Form */}
      <SignInForm />
    </div>
  );
};

export default LoginPage;
