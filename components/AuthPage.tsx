
import React, { useState } from 'react';
import { authService } from '../services/authService';

interface AuthPageProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<'auth' | 'otp'>('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const data = await authService.signIn(email, password);
                if (data.user) {
                    const userWithProfile = await authService.getCurrentUser();
                    onSuccess(userWithProfile);
                }
            } else {
                if (!username) throw new Error("Username is required");
                const data = await authService.signUp(email, password, username);
                if (data.user) {
                    // Move to OTP step
                    setStep('otp');
                }
            }
        } catch (err: any) {
            setError(err.message || "An authentication error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await authService.verifyOtp(email, otp, 'signup');
            if (data.user) {
                await authService.ensureProfile(data.user.id, username);
                const userWithProfile = await authService.getCurrentUser();
                onSuccess(userWithProfile);
            }
        } catch (err: any) {
            setError(err.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 sm:p-10 animate-in fade-in duration-500">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-900/10 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>

            <div className="relative w-full max-w-[440px] z-10">
                {/* Navigation / Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={step === 'otp' ? () => setStep('auth') : onClose}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-orange-500 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{step === 'otp' ? 'Back' : 'Return Home'}</span>
                    </button>

                    <h1 className="text-xl font-black italic tracking-tighter text-white">
                        STREAM<span className="text-orange-600">BOX</span>
                    </h1>
                </div>

                <div className="bg-zinc-950/50 backdrop-blur-3xl border border-zinc-900 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border-t-zinc-800/50">
                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white mb-2 leading-none uppercase">
                            {step === 'otp' ? 'Verify ID' : (isLogin ? 'Welcome Back' : 'Create Profile')}
                        </h2>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">
                            {step === 'otp' ? 'Authorization Required' : `Gate ${isLogin ? '01' : '02'} • Security Verified`}
                        </p>
                    </div>

                    {step === 'auth' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Protocol Nickname</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800 text-sm"
                                        placeholder="TheStreamer"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Cloud Interface</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800 text-sm"
                                    placeholder="name@nexus.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Access Sequence</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-orange-600/5 border border-orange-600/20 rounded-2xl">
                                    <p className="text-[10px] text-orange-500 font-bold text-center uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_20px_50px_-15px_rgba(234,88,12,0.4)] disabled:opacity-50 text-xs mt-4 active:scale-95"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Generate ID')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-4">
                                <p className="text-zinc-400 text-xs text-center leading-relaxed">
                                    Enter the 6-digit synchronization code sent to <span className="text-white font-bold">{email}</span>
                                </p>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-black/40 border border-zinc-800 text-white px-6 py-5 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all text-center text-3xl font-black tracking-[0.5em] placeholder:text-zinc-900"
                                    placeholder="000000"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-orange-600/5 border border-orange-600/20 rounded-2xl">
                                    <p className="text-[10px] text-orange-500 font-bold text-center uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_20px_50px_-15px_rgba(234,88,12,0.4)] disabled:opacity-50 text-xs active:scale-95"
                            >
                                {loading ? 'Verifying...' : 'Finalize Encryption'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('auth')}
                                className="w-full text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-widest text-center"
                            >
                                Use different email
                            </button>
                        </form>
                    )}

                    {step === 'auth' && (
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="w-full mt-10 text-[10px] text-zinc-600 hover:text-orange-500 transition-colors uppercase font-black tracking-widest text-center"
                        >
                            {isLogin ? "Need a new access ID? Register" : "Existing ID verified? Login here"}
                        </button>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex items-center justify-between px-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest leading-none mb-1">Status</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Encrypted
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest leading-none mb-1">Server</span>
                        <span className="text-[10px] text-zinc-500 font-mono">SB-GLOBAL-V1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
