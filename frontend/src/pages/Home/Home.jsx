import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

function Home() {
    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for the tilt
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove({ clientX, clientY, currentTarget }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
    const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);

    // Parallax Background Orbs
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Simplified animation variants
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="flex flex-col items-center gap-20 pb-32 overflow-hidden w-full bg-bg-primary" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

            {/* Cinematic Hero Section */}
            <section id="home" className="relative w-full min-h-screen flex items-center px-6 lg:px-24 py-20 z-10 overflow-hidden perspective-1000">

                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Pose_2_wo_borders.webp"
                        alt="Yoga Background"
                        className="absolute right-0 bottom-0 h-[85vh] w-auto object-contain opacity-80 translate-x-[10%] translate-y-[5%]"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent"></div>
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-bg-primary/40 pointer-events-none"></div>
                </div>

                {/* Floating Parallax Orbs */}
                <motion.div style={{ y: y1, x: -50 }} className="absolute top-20 right-[20%] w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none z-0 mix-blend-screen"></motion.div>
                <motion.div style={{ y: y2, x: 50 }} className="absolute bottom-40 left-[10%] w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></motion.div>

                {/* 3D Content Layer */}
                <motion.div
                    className="relative z-10 max-w-3xl perspective-1000"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    style={{
                        rotateX,
                        rotateY,
                        filter: useTransform(brightness, b => `brightness(${b})`)
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

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center p-1">
                        <div className="w-1 h-2 bg-primary/50 rounded-full animate-scroll-down"></div>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-primary/40">Scroll</span>
                </motion.div>
            </section>

            {/* Yoga Poses Section */}
            <section id="poses" className="w-full max-w-7xl px-6 lg:px-8 py-24 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-5xl font-serif mb-6 text-primary">Master the <span className="italic text-accent">Asanas</span></h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">Explore our library of supported poses with real-time feedback.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card title="DownDog Pose" imageSrc="/images/downdog.jpeg">
                        <p className="italic text-accent mb-2 font-serif text-lg">(Adho Mukha Svanasana)</p>
                        <p>Strengthens the arms, shoulders, and legs. Calms the brain and helps relieve stress.</p>
                    </Card>

                    <Card title="Goddess Pose" imageSrc="/images/goddess.jpg">
                        <p className="italic text-accent mb-2 font-serif text-lg">(Utkata Konasana)</p>
                        <p>Opens the hips and strengthens the lower body. Stimulates the uro-genital system.</p>
                    </Card>

                    <Card title="Plank Pose" imageSrc="/images/plank.png">
                        <p className="italic text-accent mb-2 font-serif text-lg">(Phalakasana)</p>
                        <p>Builds core strength and tones the body. Prepares the body for more challenging arm balances.</p>
                    </Card>

                    <Card title="Tree Pose" imageSrc="/images/tree.jpeg">
                        <p className="italic text-accent mb-2 font-serif text-lg">(Vrikshasana)</p>
                        <p>Improves balance and strengthens your legs. Increases focus and concentration.</p>
                    </Card>

                    <Card title="Warrior Pose" imageSrc="/images/warrior.jpeg">
                        <p className="italic text-accent mb-2 font-serif text-lg">(Virabhadrasana)</p>
                        <p>Builds stamina and stretches the chest and lungs. Strengthens shoulders and back muscles.</p>
                    </Card>

                    <div className="w-full h-full min-h-[400px] rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center p-8 text-center group hover:border-accent/30 transition-colors bg-white/20">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl text-primary/40">+</span>
                        </div>
                        <h3 className="text-xl font-serif font-semibold text-primary/60 mb-2">More Coming Soon</h3>
                        <p className="text-sm text-gray-400">We are constantly adding new poses.</p>
                    </div>
                </div>

                <div className="flex justify-center mt-20">
                    <Link to="/yoga">
                        <Button variant="primary" size="lg">Start Yoga Detection</Button>
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
                        ].map((pose, index) => (
                            <motion.div
                                key={pose.id}
                                className="group relative h-72 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-gold/20 transition-all duration-300 hover:-translate-y-1"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(/images/${pose.img})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>

                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md font-serif font-bold text-white/90">
                                    {pose.id}
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-gold transition-colors">{pose.name}</h3>
                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{pose.subtitle}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-20">
                        <Link to="/suryanamaskar">
                            <Button variant="primary" size="lg">Start Sequence</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="w-full max-w-6xl px-6 lg:px-8 py-24 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 flex justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent to-gold rounded-full blur-3xl opacity-20"></div>
                        <div className="relative w-80 h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl z-10">
                            <img src="/images/vaibhav.jpg" alt="Vaibhav Soni" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <span className="text-accent font-medium tracking-widest uppercase text-sm mb-4 block">The Developer</span>
                        <h2 className="text-5xl font-serif mb-8 text-primary">About the <span className="italic text-primary/80">Creator</span></h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                            I am <span className="font-semibold text-primary border-b-2 border-accent/30">Vaibhav Soni</span>, a Computer Science Engineering student at Indus University with a passion for leveraging technology to solve real-world problems.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8 font-light">
                            I have hands-on experience in machine learning, deep learning, and web development. My current work involves developing innovative solutions for yoga posture detection.
                        </p>
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
