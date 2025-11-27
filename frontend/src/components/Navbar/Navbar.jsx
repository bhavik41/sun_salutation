import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

function Navbar() {
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Yoga Poses', path: '/#poses' },
        { name: 'Suryanamaskar', path: '/suryanamaskar' },
        { name: 'About', path: '/#about' },
        { name: 'Contact', path: '/#contact' },
    ];

    return (
        <motion.nav
            className="fixed top-0 left-0 w-full z-50 py-4 pointer-events-none"
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
        >
            <div className="max-w-7xl mx-auto px-4 pointer-events-auto">
                <div className="flex justify-between items-center bg-primary/90 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 shadow-2xl">
                    <Link to="/" className="flex items-center group">
                        <motion.div
                            className="text-xl font-semibold text-white tracking-tight font-serif"
                            whileHover={{ scale: 1.05 }}
                        >
                            Asana<span className="italic text-accent group-hover:text-gold transition-colors">Vision</span>
                        </motion.div>
                    </Link>

                    <ul className="hidden md:flex gap-8">
                        {links.map((link) => (
                            <motion.li key={link.name} whileHover={{ y: -2 }}>
                                {link.path.startsWith('/#') ? (
                                    <a
                                        href={link.path.substring(1)}
                                        className="text-sm font-medium text-white/70 uppercase tracking-wider hover:text-gold transition-colors relative group/link"
                                    >
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover/link:w-full"></span>
                                    </a>
                                ) : (
                                    <Link
                                        to={link.path}
                                        className={`text-sm font-medium uppercase tracking-wider transition-colors relative group/link ${location.pathname === link.path ? 'text-gold' : 'text-white/70 hover:text-gold'}`}
                                    >
                                        {link.name}
                                        <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover/link:w-full'}`}></span>
                                    </Link>
                                )}
                            </motion.li>
                        ))}
                    </ul>

                    {/* Mobile Menu Button (Placeholder) */}
                    <button className="md:hidden text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.nav>
    );
}

export default Navbar;
