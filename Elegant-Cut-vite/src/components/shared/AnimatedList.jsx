import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1
        }
    }
};

export const AnimatedContainer = ({ children, className, tag = 'div', ...props }) => {
    const MotionComponent = motion[tag] || motion.div;
    return (
        <MotionComponent
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
            {...props}
        >
            {children}
        </MotionComponent>
    );
};

export const AnimatedItem = ({ children, className, tag = 'div', ...props }) => {
    const MotionComponent = motion[tag] || motion.div;
    return (
        <MotionComponent
            variants={itemVariants}
            className={className}
            whileHover={{
                y: -5,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {children}
        </MotionComponent>
    );
};
