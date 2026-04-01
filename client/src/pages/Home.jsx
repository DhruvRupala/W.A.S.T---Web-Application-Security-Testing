import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Search, Activity, BarChart3, Globe, 
  Zap, Eye, FileText, ChevronRight, Terminal, 
  ShieldCheck, Bug, Radar, Server, Users, Menu, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
  })
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Search, title: 'Vulnerability Scanning', desc: 'Automated detection of SQL injection, XSS, CSRF, and other OWASP Top 10 vulnerabilities.' },
    { icon: Lock, title: 'Secure Authentication', desc: 'Pre-approved registration, strong password policy, account lockout, and brute-force protection.' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'WebSocket-powered live scan progress and comprehensive security dashboards.' },
    { icon: FileText, title: 'PDF Reports', desc: 'Generate professional vulnerability assessment reports with risk scoring and remediation steps.' },
    { icon: Eye, title: 'Continuous Monitoring', desc: 'Schedule automated scans and track your security posture over time.' },
    { icon: Users, title: 'Admin Panel', desc: 'Manage users, view platform statistics, control access, and oversee all security operations.' },
  ];

  const stats = [
    { value: '10+', label: 'Vulnerability Checks' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: 'Real-time', label: 'Scan Monitoring' },
    { value: 'OWASP', label: 'Standard Compliant' },
  ];

  const steps = [
    { num: '01', icon: Terminal, title: 'Register & Login', desc: 'Get pre-approved access and securely authenticate into the platform.' },
    { num: '02', icon: Radar, title: 'Configure & Scan', desc: 'Enter your target URL, select scan options, and launch the vulnerability assessment.' },
    { num: '03', icon: Bug, title: 'Analyze Results', desc: 'Review discovered vulnerabilities with severity ratings and detailed findings.' },
    { num: '04', icon: ShieldCheck, title: 'Remediate & Report', desc: 'Follow remediation guidance and generate PDF reports for stakeholders.' },
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
  ];

  return (
    <div className="min-h-screen bg-cyber-black text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-cyber-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Shield size={24} className="text-cyber-blue" />
            <span className="text-lg sm:text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink">
              W.A.S.T.
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-mono text-gray-400">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className="hover:text-cyber-blue transition-colors">{link.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="cyber-btn text-xs py-2 px-4 sm:px-5">
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-mono text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Login
                </button>
                <button onClick={() => navigate('/login')} className="cyber-btn text-xs py-2 px-4 sm:px-5">
                  Get Started
                </button>
              </>
            )}

            {/* Mobile hamburger button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE NAV DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-nav-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-72 bg-cyber-dark border-l border-gray-800 z-50 p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink">
                  W.A.S.T.
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-4">
                {navLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-300 hover:text-cyber-blue font-mono text-sm border-l-2 border-transparent hover:border-cyber-blue hover:bg-cyber-blue/5 transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800 space-y-3">
                {!user && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="w-full text-sm font-mono text-gray-300 hover:text-white transition-colors px-4 py-3 text-left border-l-2 border-transparent hover:border-gray-500"
                  >
                    Login
                  </button>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate(user ? '/dashboard' : '/login'); }}
                  className="cyber-btn w-full text-xs py-3"
                >
                  {user ? 'Dashboard' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-cyber-blue/8 rounded-full blur-[100px] sm:blur-[160px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-cyber-pink/5 rounded-full blur-[80px] sm:blur-[140px]"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue text-[10px] sm:text-xs font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></span>
              <span className="hidden sm:inline">WEB APPLICATION SECURITY TESTING PLATFORM</span>
              <span className="sm:hidden">W.A.S.T. PLATFORM</span>
            </div>
          </motion.div>

          <motion.h1 
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-6 tracking-tight"
          >
            Secure Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink">
              Web Apps
            </span>
            <br />
            Before Hackers Do
          </motion.h1>

          <motion.p 
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
          >
            W.A.S.T. is a comprehensive security testing platform that scans your web applications for vulnerabilities, 
            provides real-time analysis, and generates actionable reports — all from one unified dashboard.
          </motion.p>

          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            <button 
              onClick={() => navigate('/login')}
              className="cyber-btn text-sm py-3 px-8 sm:px-10 group w-full sm:w-auto"
            >
              <Zap size={16} className="mr-2" />
              Get Started
              <ChevronRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
            <a href="#features" className="text-sm font-mono text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-8 py-3 transition-all w-full sm:w-auto text-center">
              Explore Features
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} custom={5}
            className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-panel px-4 sm:px-6 py-4 sm:py-5 text-center group hover:border-cyber-blue/30 transition-all duration-300">
                <div className="text-xl sm:text-2xl font-black text-cyber-blue mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator - hidden on small mobile */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
          <div className="w-5 h-8 border border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-2 mt-2 bg-gray-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="relative py-16 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-20"
          >
            <p className="text-xs font-mono text-cyber-blue uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
              Powerful{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink">Security</span>{' '}
              Features
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base px-2">
              Everything you need to test, monitor, and secure your web applications in one platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                  className="glass-panel p-6 sm:p-8 group hover:border-cyber-blue/30 transition-all duration-500 relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 flex items-center justify-center border border-gray-700 group-hover:border-cyber-blue/50 group-hover:bg-cyber-blue/10 transition-all duration-300 mb-4 sm:mb-6">
                      <Icon size={22} className="text-gray-500 group-hover:text-cyber-blue transition-colors duration-300" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 group-hover:text-cyber-blue transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-16 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-dark/50 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-20"
          >
            <p className="text-xs font-mono text-cyber-blue uppercase tracking-widest mb-4">Workflow</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
              How{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink">It Works</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
              From signup to security report in four simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                  className="relative text-center group"
                >
                  <div className="text-5xl sm:text-6xl font-black text-gray-800 group-hover:text-cyber-blue/20 transition-colors duration-500 mb-4 font-mono">
                    {step.num}
                  </div>
                  <div className="w-14 h-14 mx-auto flex items-center justify-center border border-gray-700 group-hover:border-cyber-blue bg-cyber-dark group-hover:bg-cyber-blue/10 transition-all duration-300 mb-5">
                    <Icon size={24} className="text-gray-500 group-hover:text-cyber-blue transition-colors" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="relative py-16 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
            >
              <p className="text-xs font-mono text-cyber-blue uppercase tracking-widest mb-4">About W.A.S.T.</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-tight">
                Built for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink">
                  Security
                </span>{' '}
                Professionals
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                W.A.S.T. (Web Application Security Testing) is a comprehensive platform designed to help developers, 
                security teams, and ethical hackers identify and remediate vulnerabilities in web applications. 
              </p>
              <p className="text-gray-400 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                Built with modern technologies — React, Node.js, and Python — the platform combines automated 
                vulnerability scanning with real-time monitoring, professional reporting, and an intuitive admin panel 
                to give you complete control over your security operations.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  'Automated OWASP Top 10 vulnerability detection',
                  'Real-time WebSocket-powered scan progress',
                  'Enterprise-grade authentication & access control',
                  'Detailed PDF vulnerability assessment reports'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-cyber-blue/10 border border-cyber-blue/30">
                      <ShieldCheck size={12} className="text-cyber-blue" />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
              custom={2}
              className="relative"
            >
              {/* Terminal-style card */}
              <div className="glass-panel border border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-cyber-dark border-b border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-cyber-pink"></div>
                  <div className="w-3 h-3 rounded-full bg-cyber-yellow"></div>
                  <div className="w-3 h-3 rounded-full bg-cyber-green"></div>
                  <span className="ml-3 text-xs text-gray-500 font-mono">wast_scanner.py</span>
                </div>
                <div className="p-4 sm:p-6 font-mono text-[10px] sm:text-xs space-y-2 text-gray-400 overflow-x-auto">
                  <p><span className="text-cyber-blue">$</span> wast scan --target https://example.com</p>
                  <p className="text-gray-600 mt-4">[ ████████████████████ ] 100% complete</p>
                  <p className="mt-4"><span className="text-cyber-green">✓</span> SQL Injection test ... <span className="text-cyber-green">passed</span></p>
                  <p><span className="text-cyber-pink">✗</span> XSS Reflected test ... <span className="text-cyber-pink">vulnerable</span></p>
                  <p><span className="text-cyber-green">✓</span> CSRF token test ... <span className="text-cyber-green">passed</span></p>
                  <p><span className="text-cyber-pink">✗</span> Security headers ... <span className="text-cyber-pink">missing</span></p>
                  <p><span className="text-cyber-green">✓</span> SSL/TLS config ... <span className="text-cyber-green">passed</span></p>
                  <p className="mt-4 text-white">─────────────────────────────</p>
                  <p><span className="text-cyber-yellow">⚠</span> Found <span className="text-cyber-pink font-bold">2</span> vulnerabilities</p>
                  <p><span className="text-cyber-blue">→</span> Risk Level: <span className="text-cyber-yellow font-bold">Medium</span></p>
                  <p><span className="text-cyber-blue">→</span> Report generated: <span className="text-gray-300">report_2026.pdf</span></p>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-cyber-blue/10 rounded-full blur-[80px]"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent"></div>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="glass-panel border border-cyber-blue/20 p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-pink to-transparent"></div>
            
            <Server size={36} className="mx-auto text-cyber-blue mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4">
              Ready to Secure Your App?
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">
              Start scanning your web applications for vulnerabilities today. Get real-time results and actionable security insights.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="cyber-btn text-sm py-3 px-8 sm:px-12 group w-full sm:w-auto"
            >
              <Shield size={16} className="mr-2" />
              Start Scanning Now
              <ChevronRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default Home;
