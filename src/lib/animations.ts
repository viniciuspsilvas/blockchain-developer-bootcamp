import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      delay: 0.2
    } 
  }
};

export const slideInFromLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.2
    }
  }
};

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.2
    }
  }
};

export const slideInFromBottom: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.2
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const sequentialFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

export const sidebarAnimation: Variants = {
  hidden: { 
    x: '-100%',
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  visible: { 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const chartAnimation: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8,
      delay: 0.2,
      ease: "easeOut"
    } 
  }
};

export const ordersAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      delay: 0.5
    } 
  }
};

export const tradesAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      delay: 0.8
    } 
  }
};

export const orderBookAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      delay: 1.1
    } 
  }
}; 