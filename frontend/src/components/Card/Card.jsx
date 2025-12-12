import React, { memo } from 'react';
import { motion } from 'framer-motion';

const Card = memo(function Card({ title, children, imageSrc, onClick }) {
    return (
        <motion.div
            className="w-full h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px", amount: 0.3 }}
            transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.3 }
            }}
            onClick={onClick}
        >
            <div
                className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-white/20 bg-white/60 backdrop-blur-md shadow-glass group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-accent/50 will-change-transform"
            >
                {imageSrc && (
                    <div className="relative w-full h-64 overflow-hidden shrink-0 bg-gray-100">
                        <img
                            src={imageSrc}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/60 opacity-30 group-hover:opacity-10 transition-opacity duration-500"></div>
                    </div>
                )}
                <div className="p-6 flex-1 flex flex-col relative bg-white/40">
                    <h3 className="text-xl font-serif font-semibold text-primary mb-2">{title}</h3>
                    <div className="text-sm text-gray-600 leading-relaxed flex-1">{children}</div>
                    <div
                        className="absolute bottom-6 right-6 text-xl text-accent transform translate-x-0 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-500 ease-out will-change-transform"
                    >
                        →
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default Card;
