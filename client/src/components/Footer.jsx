import React from 'react';
import { Globe, MessageCircle, Link as LinkIcon, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-cyber-dark/90 border-t border-gray-800">
      {/* Top glowing line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink tracking-widest mb-4">
              W.A.S.T.
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Web Application Security Testing platform. Identify vulnerabilities, protect your web assets, and stay one step ahead of threats.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, href: '#' },
                { icon: MessageCircle, href: '#' },
                { icon: LinkIcon, href: '#' },
                { icon: Mail, href: '#' },
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center border border-gray-700 text-gray-400 hover:border-cyber-blue hover:text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono text-cyber-blue uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Features', 'About', 'Login'].map((link) => (
                <li key={link}>
                  <a href={link === 'Login' ? '/login' : `#${link.toLowerCase()}`} className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors group">
                    <span className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-cyber-blue transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-mono text-cyber-blue uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'API Reference', 'Security Blog', 'OWASP Top 10'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors group">
                    <span className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-cyber-blue transition-colors"></span>
                    {link}
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-mono text-cyber-blue uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Responsible Disclosure'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors group">
                    <span className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-cyber-blue transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs font-mono">
            © {new Date().getFullYear()} W.A.S.T. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs font-mono flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyber-green animate-pulse"></span>
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
