import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import fruitfulLogo from "@assets/Fruiful_1753374425252.png";
import { X } from "lucide-react";

interface WelcomeAnimationProps {
  userName?: string;
  onComplete?: () => void;
}

export function WelcomeAnimation({ userName, onComplete }: WelcomeAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50"
          data-testid="welcome-animation-overlay"
        >
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Skip animation"
            data-testid="button-skip-animation"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2
              }}
              className="mb-8"
              data-testid="welcome-logo-container"
            >
              <img 
                src={fruitfulLogo} 
                alt="Fruitful™" 
                className="h-24 w-auto mx-auto object-contain"
                data-testid="welcome-logo"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6,
                delay: 0.5
              }}
              data-testid="welcome-greeting"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Welcome{userName ? `, ${userName}` : ''}!
              </h1>
              <p className="text-xl text-gray-600">
                FAA™ Brand Licensing System
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.5,
                delay: 1.2,
                ease: "backOut"
              }}
              className="mt-8"
              data-testid="welcome-tagline"
            >
              <p className="text-sm text-gray-500 italic">
                "If you don't like the fruits you are growing, change the seeds..."
              </p>
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 0.8,
                delay: 1.8
              }}
              className="mt-8 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full mx-auto max-w-xs"
              data-testid="welcome-progress-bar"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
