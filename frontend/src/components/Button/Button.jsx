import React from 'react';
import { motion } from 'framer-motion';

function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled = false }) {
    const baseStyles = "relative inline-flex items-center justify-center border-none outline-none cursor-pointer font-sans font-medium tracking-wide rounded-full overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

    const sizes = {
        sm: "px-5 py-2 text-sm",
        md: "px-7 py-3 text-base",
        lg: "px-10 py-4 text-lg",
    };

    const variants = {
        primary: "bg-gradient-gold text-primary-dark shadow-md hover:shadow-lg",
        secondary: "bg-transparent border border-primary text-primary hover:bg-primary/5",
        accent: "bg-gradient-accent text-white shadow-glow hover:shadow-lg",
    };

    return (
        <motion.button
            type={type}
            className={`${baseStyles} ${sizes[size]} ${variants[variant]}`}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <span className="relative z-10">{children}</span>
            {variant === 'primary' && (
                <motion.div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '100%', opacity: 0.5, transition: { duration: 0.6, ease: "easeInOut" } }}
                />
            )}
        </motion.button>
    );
}

export default Button;
