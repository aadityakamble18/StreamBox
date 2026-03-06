
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
                        <h3 className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">The Architect</h3>
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg shadow-orange-600/20">
                                AK
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white font-bold text-xl">Aaditya Kamble</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Student at <span className="text-white font-bold">IIT Jodhpur</span> and Media Technologist. Aaditya designed StreamBox to bridge the gap between broadcast stability and modern web agility, specializing in high-performance distributed systems.
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <a href="https://github.com/aadityakamble18" className="text-zinc-400 hover:text-white transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Algorithmic Deep Dive */}
                <div className="mt-32 space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">The Engine Core</h3>
                        <h2 className="text-3xl sm:text-4xl font-black text-white">Algorithmic Infrastructure</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 font-black text-xl">01</div>
                            <h4 className="text-xl font-bold text-white">Persistent Portal Architecture (PPA)</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                To achieve zero-buffering view transitions, we implemented a custom "Teleporting Player" engine. Instead of re-instantiating the video element, it uses React Portals to move the live DOM node between view slots. This preserves the memory buffer and playback state globally.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-xl">02</div>
                            <h4 className="text-xl font-bold text-white">Hierarchical Category Bisection (HCB)</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Sorting 3,000+ streams requires optimized categorization. Our HCB algorithm bifurcates data into primary singular entities (News, Movies) and specialized multi-tag clusters, applying a dual-tier alphabetical sort to ensure maximum searchability and UX clarity.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-green-600/10 flex items-center justify-center text-green-500 font-black text-xl">03</div>
                            <h4 className="text-xl font-bold text-white">Optimistic UI & Real-time Sync (ORS)</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Every interaction (likes, views, reviews) is handled via an optimistic update pattern. State changes reflect locally in ~16ms, while background Supabase Real-time broadcasts synchronize the global engagement metrics across all active users in milliseconds.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-500 font-black text-xl">04</div>
                            <h4 className="text-xl font-bold text-white">Neural Caption & Recovery Logic</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Integrated experimental Neural Live Captions using browser speech synthesis. Coupled with a 15-second "Dead-Link" watchdog algorithm that monitors HLS buffer segments to detect and report restricted or offline streams automatically.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-32 p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-zinc-900 to-black border border-white/5 relative overflow-hidden text-center shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Designed for Performance</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
                        StreamBox v1.8.0-PRO is optimized for modern browsers, utilizing GPU-accelerated rendering and multi-threaded M3U processing via Web Workers.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-orange-500 text-3xl font-black leading-none uppercase">RTX-Ready</span>
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Interface</span>
                        </div>
                        <div className="w-px h-10 bg-zinc-800 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-white text-3xl font-black leading-none">Teleport</span>
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Engine</span>
                        </div>
                        <div className="w-px h-10 bg-zinc-800 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-white text-3xl font-black leading-none">HLS.js</span>
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Backbone</span>
                        </div>
                    </div>
                </div>

                {/* Legal & Transparency Section */}
                <div className="mt-32 border-t border-zinc-900 pt-20 space-y-16">
                    <section className="space-y-6">
                        <h3 className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px]">Transparency & Legal</h3>
                        <h2 className="text-3xl font-black text-white">Disclaimer</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                StreamBox is an <span className="text-zinc-300 font-bold">Open-Source Educational Project</span> developed by Aaditya Kamble. It is designed as a technical demonstration of high-performance web-based media rendering using React, Portals, and HLS.js.
                            </p>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                <span className="text-white font-bold">Content Hosting:</span> StreamBox does not host, store, or distribute any media files. It functions exclusively as a client-side player for publicly available M3U/HLS streams provided by third-party metadata repositories.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6 bg-orange-600/5 p-8 rounded-3xl border border-orange-600/10">
                        <h4 className="text-orange-500 font-black uppercase tracking-widest text-xs">Copyright Policy (DMCA)</h4>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            StreamBox respects the intellectual property rights of others. If you believe that your copyrighted work is being accessed through this player in a way that constitutes infringement, please note that we do not control the source streams. We recommend contacting the source stream provider directly. However, if you wish to report a specific link within our educational UI, please reach out via GitHub.
                        </p>
                    </section>
                </div>

                <footer className="mt-32 pt-12 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6 text-zinc-600">
                    <div className="flex flex-col gap-2 items-center sm:items-start">
                        <p className="text-[10px] font-mono uppercase tracking-widest">© {new Date().getFullYear()} StreamBox Engine v1.8.1</p>
                        <p className="text-[9px] text-zinc-800 uppercase font-bold tracking-tighter">Developed by Aaditya Kamble • IIT Jodhpur</p>
                    </div>
                    <div className="flex gap-8">
                        <a href="https://github.com/aadityakamble18/StreamBox" className="hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">GitHub Project</a>
                        <a href="#" className="hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Privacy Policy</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};
