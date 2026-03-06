
import React, { useState } from 'react';
import { authService } from '../services/authService';

interface AuthPageProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<'auth' | 'confirm'>('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
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
                    setStep('confirm');
                }
            }
        } catch (err: any) {
            setError(err.message || "An authentication error occurred");
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
                        onClick={step === 'confirm' ? () => setStep('auth') : onClose}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-orange-500 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{step === 'confirm' ? 'Back' : 'Return Home'}</span>
                    </button>

                    <h1 className="text-xl font-black italic tracking-tighter text-white">
                        STREAM<span className="text-orange-600">BOX</span>
                    </h1>
                </div>

                <div className="bg-zinc-950/50 backdrop-blur-3xl border border-zinc-900 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border-t-zinc-800/50">
                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white mb-2 leading-none uppercase">
                            {step === 'confirm' ? 'Check Email' : (isLogin ? 'Welcome Back' : 'Create Profile')}
                        </h2>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">
                            {step === 'confirm' ? 'Verification Sent' : `StreamBox Account • ${isLogin ? 'Sign In' : 'Register'}`}
                        </p>
                    </div>

                    {step === 'auth' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800 text-sm"
                                        placeholder="Display Name"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800 text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Password</label>
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
                                {loading ? 'Processing...' : (isLogin ? 'Sign In Now' : 'Create My Account')}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-8 text-center py-4">
                            <div className="relative inline-flex items-center justify-center">
                                <div className="absolute inset-0 bg-orange-600/20 blur-2xl rounded-full"></div>
                                <div className="relative w-20 h-20 rounded-full border border-orange-500/30 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 fill-orange-500 animate-pulse"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-zinc-200 text-sm font-medium leading-relaxed px-4">
                                    We've sent a secure verification link to <br/>
                                    <span className="text-orange-500 font-black">{email}</span>
                                </p>
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                                    Click the link in the email to <br/> activate your session automatically.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep('auth')}
                                className="w-full text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-widest text-center"
                            >
                                Use different email
                            </button>
                        </div>
                    )}

                    {step === 'auth' && (
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="w-full mt-10 text-[10px] text-zinc-600 hover:text-orange-500 transition-colors uppercase font-black tracking-widest text-center"
                        >
                            {isLogin ? "New to StreamBox? Create Account" : "Already have an account? Sign In"}
                        </button>
                    )}

                    <p className="mt-8 text-[9px] text-zinc-700 text-center leading-relaxed">
                        By continuing, you acknowledge that StreamBox is an educational tool and you agree to our <span className="text-zinc-500 underline cursor-pointer">Terms</span> and <span className="text-zinc-500 underline cursor-pointer">Privacy Notice</span>.
                    </p>
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
