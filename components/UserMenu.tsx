
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface UserMenuProps {
    onOpenAuth: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuth }) => {
    const [user, setUser] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Check current session
        authService.getCurrentUser().then(setUser);

        // Listen for auth changes
        const { data: { subscription } } = authService.onAuthStateChange(setUser);

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await authService.signOut();
        setShowDropdown(false);
    };

    if (!user) {
        return (
            <button
                onClick={onOpenAuth}
                className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-[0_4px_12px_-4px_rgba(234,88,12,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(234,88,12,0.6)] active:scale-95"
            >
                Login
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-1.5 pr-4 rounded-2xl hover:bg-zinc-900 transition-all active:scale-95"
            >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-xs sm:text-sm uppercase shadow-lg">
                    {user.username?.[0] || 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start min-w-0">
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{user.username}</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest leading-none">Member</span>
                </div>
                <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-zinc-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}>
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-zinc-900 bg-zinc-900/20">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                            <p className="text-sm font-bold text-white truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all font-bold group"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
