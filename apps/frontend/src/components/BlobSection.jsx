import Orb from './Orb';

const BlobSection = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
      {/* Orb component */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={0}
            interactive={false}
            forceHoverState={false}
          />
        </div>
      </div>
      
      {/* Additional background effects */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-32 right-20 w-48 h-48 bg-purple-400 rounded-full opacity-10 blur-3xl" />
    </div>
  );
};

export default BlobSection;
