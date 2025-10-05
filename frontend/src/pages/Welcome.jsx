import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: '📝',
    title: 'Easy Task Management',
    description: 'Create, organize, and prioritize your tasks with an intuitive interface.'
  },
  {
    icon: '🚀',
    title: 'Boost Productivity',
    description: 'Stay focused and get more done with our powerful task management tools.'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data is always protected with enterprise-grade security.'
  }
];

const FeatureCard = ({ icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 * index, duration: 0.5 }}
    whileHover={{ y: -10, scale: 1.03 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <motion.div 
      className="text-4xl mb-4 inline-block"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {icon}
    </motion.div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

export default function Welcome() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative inline-block"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to TaskFlow
          </motion.h1>
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ delay: 0.4, duration: 1 }}
          />
        </motion.div>
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          The ultimate task management solution to organize your work and boost productivity
        </motion.p>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative"
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.4
              }
            }
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} index={index} {...feature} />
          ))}
          
          {/* Floating animation elements */}
          <motion.div 
            className="absolute -z-10 w-64 h-64 rounded-full bg-indigo-200 dark:bg-indigo-900/30 blur-3xl opacity-50"
            animate={{
              x: [0, 20, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse'
            }}
          />
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20"
            >
              Get Started - It's Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/login"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium rounded-lg text-lg hover:bg-indigo-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Sign In
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-6 text-gray-500 dark:text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {['No credit card required', 'Free forever', '24/7 support'].map((text, index) => (
            <motion.span 
              key={index}
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05, color: '#6366f1' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                ✓
              </motion.span>
              {text}
            </motion.span>
          ))}
        </motion.div>
        
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-100 dark:bg-indigo-900/30"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.1 + 0.02,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 30 + 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
