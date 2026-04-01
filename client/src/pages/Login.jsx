import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const passwordRules = [
  { label: 'Min 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const passedRules = useMemo(() => passwordRules.map(r => r.test(password)), [password]);
  const passedCount = passedRules.filter(Boolean).length;
  const allPassed = passedCount === passwordRules.length;

  const strengthPercent = (passedCount / passwordRules.length) * 100;
  const strengthColor =
    strengthPercent <= 20 ? '#ef4444' :
    strengthPercent <= 40 ? '#f97316' :
    strengthPercent <= 60 ? '#eab308' :
    strengthPercent <= 80 ? '#22d3ee' :
    '#00ff88';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      if (typeof err === 'object' && err !== null) {
        setError(err.message || 'Something went wrong');
        if (err.errors) setErrors(err.errors);
      } else {
        setError(err || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || (!isLogin && !allPassed);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-blue/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyber-pink/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass-panel border border-cyber-blue/30 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-cyber-dark rounded-full border border-cyber-blue relative group">
            <div className="absolute inset-0 rounded-full animate-ping bg-cyber-blue/20"></div>
            <Shield size={40} className="text-cyber-blue" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center mb-2 tracking-widest uppercase">
          {isLogin ? 'Initialize' : 'Register'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink">System</span>
        </h2>
        <p className="text-center text-gray-400 font-mono text-xs mb-8">AUTHENTICATION REQUIRED</p>

        {error && (
          <div className="mb-4 p-3 bg-cyber-pink/10 border border-cyber-pink text-cyber-pink font-mono text-sm text-center">
            ERROR: {error}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-cyber-pink/10 border border-cyber-pink/50 font-mono text-xs space-y-1">
            {errors.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-cyber-pink">
                <X size={12} /> {e}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-cyber-blue mb-2 uppercase">Op ID (Email)</label>
            <input 
              type="email" 
              required
              className="cyber-input" 
              placeholder="operator@wast.sys"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-mono text-cyber-blue mb-2 uppercase">Operator Name (Optional)</label>
              <input 
                type="text" 
                className="cyber-input" 
                placeholder="Neo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-cyber-blue mb-2 uppercase">Passcode</label>
            <div className="relative">
              <input 
                type={showPwd ? "text" : "password"}
                required
                className="cyber-input pr-10" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-blue transition-colors"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator — only on Register */}
          <AnimatePresence>
            {!isLogin && password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Strength Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-400 uppercase">Strength</span>
                    <span className="text-xs font-mono" style={{ color: strengthColor }}>
                      {passedCount}/{passwordRules.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-cyber-dark rounded-full overflow-hidden border border-gray-700">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: strengthColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 gap-1">
                  {passwordRules.map((rule, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs font-mono transition-colors ${
                        passedRules[i] ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {passedRules[i] ? <Check size={12} /> : <X size={12} />}
                      {rule.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className={`cyber-btn w-full mt-8 ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitDisabled}
          >
            {loading ? 'Processing...' : isLogin ? 'Access System' : 'Create Credentials'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setErrors([]); }}
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors underline decoration-dashed decoration-cyber-blue underline-offset-4"
          >
            {isLogin ? "First time? Register new Operator ID" : "Have credentials? Access System"}
          </button>
        </div>

        {!isLogin && (
          <p className="text-center text-gray-600 font-mono text-[10px] mt-4">
            ⚠ Only pre-approved emails can register. Contact admin for access.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
