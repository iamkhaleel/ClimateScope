import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaSun,
  FaWind,
  FaCloudRain,
  FaSmile,
  FaThermometerHalf,
  FaTint,
  FaCloud,
  FaTimes,
} from "react-icons/fa";

// Animation variants for different weather conditions
const animationVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.8,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 180,
    transition: {
      duration: 0.3,
    },
  },
};

// Very Hot Animation (Temperature > 35°C)
const VeryHotAnimation = ({ onClose }) => (
  <motion.div
    variants={animationVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Close button */}
    <motion.button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaTimes className="text-xl" />
    </motion.button>
    <div className="relative">
      {/* Fire particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-6 h-6 bg-red-500 rounded-full"
          animate={{
            y: [-30, -80, -120],
            x: [0, Math.random() * 60 - 30, Math.random() * 120 - 60],
            opacity: [1, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
          style={{
            left: `${20 + i * 10}%`,
            top: "50%",
          }}
        />
      ))}

      {/* Main fire icon */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-9xl text-red-500 drop-shadow-2xl"
      >
        <FaFire />
      </motion.div>

      {/* Heat waves */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-red-400"
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.8, 0.4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-orange-400"
        animate={{
          scale: [1, 1.3, 1.6],
          opacity: [0.6, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
          ease: "easeOut",
        }}
      />
    </div>
  </motion.div>
);

// Hot Animation (Temperature 30-35°C)
const HotAnimation = ({ onClose }) => (
  <motion.div
    variants={animationVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Close button */}
    <motion.button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaTimes className="text-xl" />
    </motion.button>
    <div className="relative">
      {/* Sun rays */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-12 bg-yellow-400"
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "bottom center",
            transform: `rotate(${i * 30}deg)`,
            left: "50%",
            top: "50%",
            marginLeft: "-2px",
            marginTop: "-40px",
          }}
        />
      ))}

      {/* Main sun icon */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="text-8xl text-yellow-500 drop-shadow-xl"
      >
        <FaSun />
      </motion.div>
    </div>
  </motion.div>
);

// Very Windy Animation (Wind Speed > 10 m/s)
const VeryWindyAnimation = ({ onClose }) => (
  <motion.div
    variants={animationVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Close button */}
    <motion.button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaTimes className="text-xl" />
    </motion.button>
    <div className="relative">
      {/* Wind particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-blue-300 rounded-full"
          animate={{
            x: [-100, window.innerWidth + 100],
            y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "linear",
          }}
          style={{
            top: `${30 + i * 5}%`,
            left: "-100px",
          }}
        />
      ))}

      {/* Main wind icon */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-9xl text-blue-500 drop-shadow-xl"
      >
        <FaWind />
      </motion.div>

      {/* Wind lines */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-2 bg-blue-300 rounded-full"
          animate={{
            x: [-50, 50, -50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
          style={{
            top: `${40 + i * 10}%`,
            left: "50%",
            marginLeft: "-32px",
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Very Wet Animation (Rainfall > 5 mm)
const VeryWetAnimation = ({ onClose }) => (
  <motion.div
    variants={animationVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Close button */}
    <motion.button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaTimes className="text-xl" />
    </motion.button>
    <div className="relative">
      {/* Rain drops */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-12 bg-blue-400 rounded-full"
          animate={{
            y: [-50, window.innerHeight + 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: "-50px",
          }}
        />
      ))}

      {/* Main rain cloud */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-9xl text-gray-500 drop-shadow-2xl"
      >
        <FaCloudRain />
      </motion.div>

      {/* Water droplets around the cloud */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-blue-300 rounded-full"
          animate={{
            y: [0, 20, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          style={{
            left: `${45 + i * 2}%`,
            top: "60%",
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Very Comfortable Animation (Temperature 20-30°C, low rainfall, moderate conditions)
const VeryComfortableAnimation = ({ onClose }) => (
  <motion.div
    variants={animationVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Close button */}
    <motion.button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaTimes className="text-xl" />
    </motion.button>
    <div className="relative">
      {/* Floating hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl text-pink-400"
          animate={{
            y: [-20, -60, -100],
            x: [0, Math.random() * 40 - 20],
            opacity: [1, 0.8, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: "50%",
          }}
        >
          💚
        </motion.div>
      ))}

      {/* Main happy face */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-9xl text-green-500 drop-shadow-xl"
      >
        <FaSmile />
      </motion.div>

      {/* Gentle sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-yellow-300 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
          style={{
            left: `${30 + i * 8}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Main Weather Animation Component
export default function WeatherAnimations({
  weatherData,
  showAnimation,
  onAnimationComplete,
}) {
  if (!showAnimation || !weatherData) return null;

  const {
    Temperature,
    Rainfall,
    "Wind Speed": WindSpeed,
    Humidity,
  } = weatherData;

  // Determine which animation to show based on weather conditions
  let animationType = null;

  if (Temperature > 35) {
    animationType = "veryHot";
  } else if (Temperature >= 30 && Temperature <= 35) {
    animationType = "hot";
  } else if (WindSpeed > 10) {
    animationType = "veryWindy";
  } else if (Rainfall > 5) {
    animationType = "veryWet";
  } else if (
    Temperature >= 20 &&
    Temperature <= 30 &&
    Rainfall <= 2 &&
    WindSpeed <= 8
  ) {
    animationType = "veryComfortable";
  }

  const renderAnimation = () => {
    switch (animationType) {
      case "veryHot":
        return <VeryHotAnimation onClose={onAnimationComplete} />;
      case "hot":
        return <HotAnimation onClose={onAnimationComplete} />;
      case "veryWindy":
        return <VeryWindyAnimation onClose={onAnimationComplete} />;
      case "veryWet":
        return <VeryWetAnimation onClose={onAnimationComplete} />;
      case "veryComfortable":
        return <VeryComfortableAnimation onClose={onAnimationComplete} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {renderAnimation()}
    </AnimatePresence>
  );
}
