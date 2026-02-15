
import React from 'react';

interface AboutPageProps {
    onClose: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-orange-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 sm:py-24 relative">
                <button
                    onClick={onClose}
                    className="group mb-12 flex items-center gap-3 text-zinc-500 hover:text-white transition-colors"
                >
                    <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-orange-500/50 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current rotate-180"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Return to Stream</span>
                </button>

                <header className="mb-20">
                    <h1 className="text-5xl sm:text-8xl font-black italic tracking-tighter text-white mb-6">
                        STREAM<span className="text-orange-600">BOX</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl">
                        A high-performance, web-native media engine designed for the next generation of global broadcasting.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20">
                    <section className="space-y-6">
                        <h3 className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">The Vision</h3>
                        <p className="text-zinc-300 leading-relaxed text-lg">
                            StreamBox was born from a simple question: <span className="text-white font-bold italic">Why can't web-based streaming feel as powerful as a desktop workstation?</span>
                        </p>
                        <p className="text-zinc-500 leading-relaxed">
                            Inspired by the robustness of VLC and the elegance of modern cinematic interfaces, we built a player that stays alive. Whether you're browsing thousands of channels or switching to a floating mini-player, the signal never drops.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">The Technology</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { title: 'Cloud Core', desc: 'Global social discovery powered by Supabase Real-time.' },
                                { title: 'HLS Matrix', desc: 'Custom adaptive bitrate engine with instant recovery.' },
                                { title: 'Zero Latency', desc: 'Web worker-driven M3U parsing for near-instant channel loading.' },
                                { title: 'Glassmorphism UI', desc: 'GPU-accelerated interface with cinematic blurs and overlays.' }
                            ].map((tech, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-orange-500/30 transition-colors">
                                    <h4 className="text-white font-bold mb-1">{tech.title}</h4>
                                    <p className="text-zinc-500 text-sm">{tech.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="mt-32 p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-zinc-900 to-black border border-white/5 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Community Driven</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
                        Everything you see—from the trending metrics to the live reviews—is built using collaborative data. Your engagement helps others discover high-quality streams from across the globe.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-orange-500 text-3xl font-black leading-none">Global</span>
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Availability</span>
                        </div>
                        <div className="w-px h-10 bg-zinc-800 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-white text-3xl font-black leading-none">Instant</span>
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Handshake</span>
                        </div>
                        <div className="w-px h-10 bg-zinc-800 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-white text-3xl font-black leading-none">Open</span>
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Architecture</span>
                        </div>
                    </div>
                </div>

                <footer className="mt-32 pt-12 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6 text-zinc-600">
                    <p className="text-xs font-mono uppercase tracking-widest">© {new Date().getFullYear()} StreamBox Engine v1.4.1</p>
                    <div className="flex gap-8">
                        <a href="https://github.com/aadityakamble18/StreamBox" className="hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Source Code</a>
                        <a href="#" className="hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">License</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};
