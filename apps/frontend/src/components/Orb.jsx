export function Orb({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Main orb with gradient */}
      <div className="relative w-[400px] h-[400px]">
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 animate-pulse"
          style={{
            background: `radial-gradient(circle, 
              rgba(100, 30, 167, 0.4) 0%, 
              rgba(139, 83, 195, 0.3) 30%, 
              rgba(201, 163, 238, 0.2) 70%, 
              transparent 100%)`
          }}
        />
        
        {/* Middle ring */}
        <div 
          className="absolute inset-4 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle, 
              rgba(100, 30, 167, 0.6) 0%, 
              rgba(139, 83, 195, 0.4) 50%, 
              rgba(201, 163, 238, 0.3) 80%, 
              transparent 100%)`
          }}
        />
        
        {/* Inner core */}
        <div 
          className="absolute inset-8 rounded-full"
          style={{
            background: `radial-gradient(circle, 
              rgba(100, 30, 167, 0.9) 0%, 
              rgba(139, 83, 195, 0.7) 40%, 
              rgba(201, 163, 238, 0.5) 70%, 
              rgba(100, 30, 167, 0.3) 100%)`
          }}
        />
        
        {/* Central bright spot */}
        <div 
          className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
          style={{
            background: `radial-gradient(circle, 
              rgba(201, 163, 238, 0.8) 0%, 
              rgba(181, 136, 224, 0.6) 50%, 
              transparent 100%)`
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div 
            className="absolute w-2 h-2 bg-core-prim-200 rounded-full opacity-60 animate-ping"
            style={{ 
              top: '20%', 
              left: '30%',
              animationDelay: '0s',
              animationDuration: '3s'
            }}
          />
          <div 
            className="absolute w-1.5 h-1.5 bg-core-prim-100 rounded-full opacity-40 animate-ping"
            style={{ 
              top: '70%', 
              left: '80%',
              animationDelay: '1s',
              animationDuration: '4s'
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-core-prim-300 rounded-full opacity-50 animate-ping"
            style={{ 
              top: '40%', 
              left: '85%',
              animationDelay: '2s',
              animationDuration: '5s'
            }}
          />
          <div 
            className="absolute w-2.5 h-2.5 bg-core-prim-200 rounded-full opacity-30 animate-ping"
            style={{ 
              top: '80%', 
              left: '20%',
              animationDelay: '1.5s',
              animationDuration: '3.5s'
            }}
          />
        </div>
        
        {/* Subtle rotating border effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 animate-spin"
          style={{
            background: `conic-gradient(from 0deg, 
              transparent 0deg, 
              rgba(201, 163, 238, 0.3) 90deg, 
              transparent 180deg, 
              rgba(100, 30, 167, 0.4) 270deg, 
              transparent 360deg)`,
            animationDuration: '8s'
          }}
        />
      </div>
    </div>
  );
}
