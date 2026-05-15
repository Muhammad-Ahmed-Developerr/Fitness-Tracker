import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { verifyOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await verifyOTP(email, otp);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 w-full max-w-md relative z-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-accent/10 p-4 rounded-full">
            <ShieldCheck className="w-10 h-10 text-accent" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Verify Email</h2>
        <p className="text-textMuted mb-8">
          We've sent a 6-digit code to <br/>
          <span className="text-white font-medium">{email}</span>
        </p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm">Verification successful! Redirecting...</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" 
            placeholder="000000" 
            maxLength={6}
            className="glass-input text-center text-2xl tracking-widest font-mono"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            required
          />

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || success}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
