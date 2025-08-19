import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fadeOut") {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 150); // Half of the transition duration

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  const transitionClasses = {
    fadeIn:
      "opacity-100 transform translate-y-0 transition-all duration-300 ease-out h-full",
    fadeOut:
      "opacity-0 transform translate-y-2 transition-all duration-300 ease-in h-full",
  };

  return <div className={transitionClasses[transitionStage]}>{children}</div>;
};

export default RouteTransition;
