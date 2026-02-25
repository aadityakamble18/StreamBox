
import React, { useState } from 'react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
    onSearch: (query: string) => void;
    onOpenAuth: () => void;
    onGoHome: () => void;
    onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenAuth, onGoHome, onToggleSidebar }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between bg-[#0a0a0a] border-b border-zinc-900 sticky top-0 z-[100] gap-4">
            {/* Left Area - Simple Brand */}
            <div className="flex items-center gap-4 shrink-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors hidden md:block"
                    title="Toggle Sidebar"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-400"><path d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z" /></svg>
                </button>
                <div
                    onClick={onGoHome}
                    className="flex items-center gap-1 cursor-pointer"
                >
                    <h1 className="text-xl font-black italic tracking-tighter text-white">
                        STREAM<span className="text-orange-600">BOX</span>
                    </h1>
                </div>
            </div>

            {/* Center - Premium Search */}
            <div className="flex-1 max-w-2xl hidden md:flex items-center">
                <form
                    onSubmit={handleSearch}
                    className="flex-1 flex items-center h-10 group relative"
                >
                    <div className="flex-1 flex items-center bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-4 hover:bg-zinc-900/60 hover:border-zinc-700 focus-within:bg-zinc-900 focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-300">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-500 group-focus-within:fill-orange-500 transition-colors shrink-0 mr-3">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search channels, categories, or country..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                onSearch(e.target.value); // Real-time search experience
                            }}
                            className="bg-transparent w-full text-white text-sm focus:outline-none placeholder:text-zinc-600 font-medium py-2"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); onSearch(''); }}
                                className="p-1 hover:bg-zinc-800 rounded-full transition-colors ml-2"
                            >
                                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-zinc-500"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                            </button>
                        )}
                        {!query && (
                            <div className="hidden lg:flex items-center gap-1.5 ml-3 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950/50">
                                <span className="text-[10px] font-black text-zinc-600">CMD</span>
                                <span className="text-[10px] font-black text-zinc-600">K</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Right Area - User Only */}
            <div className="flex items-center gap-4 shrink-0">
                <UserMenu onOpenAuth={onOpenAuth} />
            </div>
        </header>
    );
};
