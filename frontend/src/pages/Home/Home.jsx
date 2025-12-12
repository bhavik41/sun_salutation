import React, { useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

function Home() {
    const navigate = useNavigate();

    // 3D Tilt Logic with optimizations
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for the tilt with reduced stiffness for smoother motion
    const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 100, damping: 20 });

    // Debounced mouse move handler
    let rafId = useRef(null);
    const handleMouseMove = useCallback(({ clientX, clientY, currentTarget }) => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }

        rafId.current = requestAnimationFrame(() => {
            const { left, top, width, height } = currentTarget.getBoundingClientRect();
            const xPct = (clientX - left) / width - 0.5;
            const yPct = (clientY - top) / height - 0.5;
            x.set(xPct);
            y.set(yPct);
        });
    }, [x, y]);

    const handleMouseLeave = useCallback(() => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }
        x.set(0);
        y.set(0);
    }, [x, y]);

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);
    const brightness = useTransform(mouseY, [-0.5, 0.5], [1.05, 0.95]);

    // Parallax Background Orbs
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);

    // Simplified animation variants
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    // ADDED: Handle pose card click
    const handlePoseClick = (poseName) => {
        navigate(`/yoga?pose=${encodeURIComponent(poseName)}`);
    };

    return (
        <div className="flex flex-col items-center gap-20 pb-32 overflow-hidden w-full bg-bg-primary">

            {/* Cinematic Hero Section */}
            <section id="home" className="relative w-full min-h-screen flex items-center px-6 lg:px-24 py-20 z-10 overflow-hidden">

                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Pose_2_wo_borders.webp"
                        alt="Yoga Background"
                        className="absolute right-0 bottom-0 h-[85vh] w-auto object-contain opacity-80 translate-x-[10%] translate-y-[5%]"
                        loading="eager"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent"></div>
                </div>

                {/* 3D Content Layer - Only apply tilt on non-mobile */}
                <motion.div
                    className="relative z-10 max-w-3xl"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.15 } }
                    }}
                    style={{
                        rotateX,
                        rotateY,
                    }}
                >
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 shadow-lg hover:bg-white/10 transition-colors cursor-default">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(238,156,167,0.5)]"></span>
                        <span className="text-sm font-medium text-primary/90 tracking-wide uppercase">AI-Powered Yoga Assistant</span>
                    </motion.div>

                    <motion.h1 variants={fadeUp} className="text-6xl lg:text-8xl font-serif font-medium mb-8 leading-[1.05] text-primary tracking-tight drop-shadow-sm">
                        Find Your <br />
                        <span className="relative inline-block">
                            <span className="relative z-10 italic bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent pr-4">Flow State</span>
                            <svg className="absolute w-full h-4 -bottom-1 left-0 text-gold/30 -z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed font-light drop-shadow-sm">
                        Experience real-time pose detection with precision.
                        Unite mind, body, and technology in perfect harmony.
                    </motion.p>

                    <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                        <Link to="/yoga">
                            <Button variant="primary" size="lg" className="shadow-[0_0_20px_rgba(15,32,39,0.2)] hover:shadow-[0_0_30px_rgba(15,32,39,0.4)] transition-shadow">Start Journey</Button>
                        </Link>
                        <Link to="/suryanamaskar">
                            <Button variant="secondary" size="lg" className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20">Suryanamaskar</Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Yoga Poses Section */}
            <section id="poses" className="w-full max-w-7xl px-6 lg:px-8 py-24 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-5xl font-serif mb-6 text-primary">Master the <span className="italic text-accent">Asanas</span></h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">Click on any pose to start detection for that specific pose.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {useMemo(() => {
                        // Smart image mapping - uses AI-generated images where available, 
                        // or maps to similar existing yoga images
                        const poseImageMap = {
                            'Adho Mukha Svanasana': '/images/poses/adho-mukha-svanasana.jpg',
                            'Adho Mukha Vrksasana': '/images/poses/adho-mukha-vrksasana.jpg',
                            'Alanasana': '/images/poses/alanasana.jpg',
                            'Anjaneyasana': '/images/poses/anjaneyasana.jpg',
                            'Ardha Chandrasana': '/images/poses/ardha-chandrasana.jpg',
                            'Ardha Matsyendrasana': '/images/poses/ardha-matsyendrasana.jpg',
                            'Ardha Navasana': '/images/poses/ardha-navasana.jpg',
                            'Ardha Pincha Mayurasana': '/images/downdog.jpeg',
                            'Ashta Chandrasana': '/images/4.jpeg',
                            'Baddha Konasana': '/images/goddess.jpg',
                            'Bakasana': '/images/poses/bakasana.jpg',
                            'Balasana': '/images/poses/balasana.jpg',
                            'Bitilasana': '/images/poses/bitilasana.jpg',
                            'Camatkarasana': '/images/poses/camatkarasana.jpg',
                            'Dhanurasana': '/images/7.jpeg',
                            'Eka Pada Rajakapotasana': '/images/poses/eka-pada-rajakapotasana.jpg',
                            'Garudasana': '/images/poses/garudasana.jpg',
                            'Halasana': '/images/poses/halasana.jpg',
                            'Hanumanasana': '/images/poses/hanumanasana.png',
                            'Malasana': '/images/goddess.jpg',
                            'Marjaryasana': '/images/poses/marjaryasana.jpg',
                            'Navasana': '/images/poses/navasana.jpg',
                            'Padmasana': '/images/poses/padmasana.jpg',
                            'Parsva Virabhadrasana': '/images/warrior.jpeg',
                            'Parsvottanasana': '/images/3.jpeg',
                            'Paschimottanasana': '/images/poses/paschimottanasana.jpg',
                            'Phalakasana': '/images/plank.png',
                            'Pincha Mayurasana': '/images/poses/pincha-mayurasana.jpg',
                            'Salamba Bhujangasana': '/images/7.jpeg',
                            'Salamba Sarvangasana': '/images/poses/salamba-sarvangasana.jpg',
                            'Setu Bandha Sarvangasana': '/images/poses/setu-bandha-sarvangasana.jpg',
                            'Sivasana': '/images/poses/sivasana.jpg',
                            'Supta Kapotasana': '/images/poses/supta-kapotasana.jpg',
                            'Trikonasana': '/images/poses/trikonasana.jpg',
                            'Upavistha Konasana': '/images/poses/upavistha-konasana.jpg',
                            'Urdhva Dhanurasana': '/images/poses/urdhva-dhanurasana.jpg',
                            'Urdhva Mukha Svsnssana': '/images/8.jpeg',
                            'Ustrasana': '/images/poses/ustrasana.jpg',
                            'Utkatasana': '/images/poses/utkatasana.jpg',
                            'Uttanasana': '/images/3.jpeg',
                            'Utthita Hasta Padangusthasana': '/images/poses/utthita-hasta-padangusthasana.jpg',
                            // 'Utthita Parsvakonasana': '/images/warrior.jpeg',
                            'Vasisthasana': '/images/plank.png',
                            // 'Virabhadrasana One': '/images/warrior.jpeg',
                            // 'Virabhadrasana Three': '/images/warrior.jpeg',
                            // 'Virabhadrasana Two': '/images/warrior.jpeg',
                            'Vrksasana': '/images/tree.jpeg'
                        };

                        const poses = [
                            'Adho Mukha Svanasana',
                            'Adho Mukha Vrksasana',
                            'Alanasana',
                            'Anjaneyasana',
                            'Ardha Chandrasana',
                            'Ardha Matsyendrasana',
                            'Ardha Navasana',
                            'Ardha Pincha Mayurasana',
                            'Ashta Chandrasana',
                            'Baddha Konasana',
                            'Bakasana',
                            'Balasana',
                            'Bitilasana',
                            'Camatkarasana',
                            'Dhanurasana',
                            'Eka Pada Rajakapotasana',
                            'Garudasana',
                            'Halasana',
                            'Hanumanasana',
                            'Malasana',
                            'Marjaryasana',
                            'Navasana',
                            'Padmasana',
                            'Parsva Virabhadrasana',
                            'Parsvottanasana',
                            'Paschimottanasana',
                            'Phalakasana',
                            'Pincha Mayurasana',
                            'Salamba Bhujangasana',
                            'Salamba Sarvangasana',
                            'Setu Bandha Sarvangasana',
                            'Sivasana',
                            'Supta Kapotasana',
                            'Trikonasana',
                            'Upavistha Konasana',
                            'Urdhva Dhanurasana',
                            'Urdhva Mukha Svsnssana',
                            'Ustrasana',
                            'Utkatasana',
                            'Uttanasana',
                            'Utthita Hasta Padangusthasana',
                            // 'Utthita Parsvakonasana',
                            'Vasisthasana',
                            // 'Virabhadrasana One',
                            // 'Virabhadrasana Three',
                            // 'Virabhadrasana Two',
                            'Vrksasana'
                        ];


                        return poses.map((pose, index) => (
                            <Card
                                key={pose}
                                title={pose}
                                imageSrc={poseImageMap[pose] || '/images/yoga-placeholder.jpg'}
                                onClick={() => handlePoseClick(pose)}
                            >
                                {/* <p className="italic text-accent mb-2 font-serif text-lg">({pose})</p> */}
                                <p>Click to start detection for this pose.</p>
                            </Card>
                        ));
                    }, [])}
                </div>

                <div className="flex justify-center mt-20">
                    <Link to="/yoga">
                        <Button variant="primary" size="lg">Start Yoga Detection (All Poses)</Button>
                    </Link>
                </div>
            </section>

            {/* Suryanamaskar Section */}
            <section id="suryanamaskar" className="w-full bg-primary text-white py-32 relative overflow-hidden z-10">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-serif mb-6">The <span className="italic text-gold">Sun Salutation</span></h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">A sequence of 12 powerful yoga poses. Perform these asanas in a continuous flow.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            { id: 1, name: "Pranamasana", subtitle: "Prayer Pose", img: "1.jpeg" },
                            { id: 2, name: "Hastauttanasana", subtitle: "Raised Arms Pose", img: "2.jpeg" },
                            { id: 3, name: "Padahastasana", subtitle: "Hand to Foot Pose", img: "3.jpeg" },
                            { id: 4, name: "Ashwa Sanchalanasana", subtitle: "Equestrian Pose", img: "4.jpeg" },
                            { id: 5, name: "Dandasana", subtitle: "Stick Pose", img: "5.jpeg" },
                            { id: 6, name: "Ashtanga Namaskara", subtitle: "Salute with Eight Limbs", img: "6.jpeg" },
                            { id: 7, name: "Bhujangasana", subtitle: "Cobra Pose", img: "7.jpeg" },
                            { id: 8, name: "Adho Mukha Svanasana", subtitle: "Downward Facing Dog", img: "8.jpeg" },
                            { id: 9, name: "Ashwa Sanchalanasana", subtitle: "Equestrian Pose", img: "9.jpeg" },
                            { id: 10, name: "Padahastasana", subtitle: "Hand to Foot Pose", img: "10.jpeg" },
                            { id: 11, name: "Hastauttanasana", subtitle: "Raised Arms Pose", img: "11.jpeg" },
                            { id: 12, name: "Pranamasana", subtitle: "Prayer Pose", img: "12.jpeg" }
                        ].map((pose) => (
                            <div
                                key={pose.id}
                                className="group relative h-72 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-gold/20 transition-all duration-300 hover:-translate-y-1 will-change-transform"
                            >
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 will-change-transform" style={{ backgroundImage: `url(/images/${pose.img})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>

                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md font-serif font-bold text-white/90">
                                    {pose.id}
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-gold transition-colors">{pose.name}</h3>
                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{pose.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-20">
                        <Link to="/suryanamaskar">
                            <Button variant="primary" size="lg">Start Sequence</Button>
                        </Link>
                    </div>
                </div>
            </section>


            {/* Contact Section */}
            <section id="contact" className="w-full max-w-4xl px-6 lg:px-8 pb-32 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-12 md:p-16 shadow-glass relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-gold to-primary"></div>

                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif mb-4 text-primary">Get in <span className="italic text-accent">Touch</span></h2>
                        <p className="text-gray-500 font-light">Have questions or feedback? We'd love to hear from you.</p>
                    </div>

                    <form action="https://api.web3forms.com/submit" method="POST" className="space-y-8">
                        <input type="hidden" name="access_key" value="f4c02020-70c3-4275-b08c-9e34092ee12b" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 group">
                                <label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-primary transition-colors">Name</label>
                                <input type="text" name="name" id="name" required placeholder="John Doe" className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none transition-all placeholder-gray-300 text-lg" />
                            </div>

                            <div className="space-y-2 group">
                                <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-primary transition-colors">Email</label>
                                <input type="email" name="email" id="email" required placeholder="john@example.com" className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none transition-all placeholder-gray-300 text-lg" />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label htmlFor="message" className="text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-primary transition-colors">Message</label>
                            <textarea name="message" id="message" rows="4" required placeholder="How can we help you?" className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none transition-all placeholder-gray-300 text-lg resize-none"></textarea>
                        </div>

                        <div className="flex justify-center pt-8">
                            <Button type="submit" variant="primary" size="lg">Send Message</Button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default Home;