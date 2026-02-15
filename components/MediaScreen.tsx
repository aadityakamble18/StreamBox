
import React, { useEffect, useState, useRef } from 'react';
import { MediaItem } from '../types';
import Hls from 'hls.js';

interface MediaScreenProps {
  media: MediaItem | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onEnded: () => void;
  isMini?: boolean;
  showCaptions?: boolean;
}

export const MediaScreen: React.FC<MediaScreenProps> = ({ media, videoRef, onEnded, isMini = false, showCaptions = false }) => {
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveCaption, setLiveCaption] = useState<string>("");
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Neural Live Caption Engine Logic
  useEffect(() => {
    if (!showCaptions || isMini) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setLiveCaption("");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setLiveCaption(transcript);

      // Auto-clear logic for "Live" feel
      if (event.results[event.results.length - 1].isFinal) {
        setTimeout(() => setLiveCaption(""), 3000);
      }
    };

    recognition.onerror = () => {
      // recognition.start(); // Auto-restart if it fails
    };

    recognition.onend = () => {
      if (showCaptions) recognition.start();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) { }

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [showCaptions, isMini]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media) return;

    // Reset state
    setIsBuffering(true);
    setError(null);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    // 15-second timeout algorithm for "Dead Stream" detection
    timeoutRef.current = window.setTimeout(() => {
      if (isBuffering && !error) {
        setError("Stream Timeout: This link may be dead or restricted.");
        setIsBuffering(false);
      }
    }, 15000);

    const cleanupHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    if (media.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        cleanupHls();

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 2,
        });

        hls.loadSource(media.url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            // Silently fail, usually requires user interaction
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("HLS Fatal Error:", data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (data.details === 'manifestLoadError') {
                  setError("Connection Refused: Resource might be offline or CORS blocked.");
                  setIsBuffering(false);
                } else {
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setError("Playback Error: This stream is currently unavailable.");
                setIsBuffering(false);
                cleanupHls();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = media.url;
      }
    } else {
      video.src = media.url;
    }

    const onPlaying = () => {
      setIsBuffering(false);
      setError(null);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };

    const onWaiting = () => setIsBuffering(true);
    const onError = () => {
      setError("Native Player Error: Direct stream link failed.");
      setIsBuffering(false);
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('error', onError);

    return () => {
      cleanupHls();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('error', onError);
    };
  }, [media, videoRef]);

  if (!media) return null;

  return (
    <div className="h-full w-full bg-black flex items-center justify-center overflow-hidden relative">
      <video
        ref={videoRef}
        className={`h-full w-full object-contain transition-opacity duration-700 ${error ? 'opacity-20' : 'opacity-100'}`}
        onEnded={onEnded}
        autoPlay
        playsInline
        crossOrigin="anonymous"
      />

      {/* Loading Overlay */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20 pointer-events-none transition-opacity duration-300">
          <div className={`${isMini ? 'w-8 h-8 border-2' : 'w-16 h-16 border-4'} border-white/10 border-t-orange-500 rounded-full animate-spin`}></div>
          {!isMini && (
            <div className="mt-8 flex flex-col items-center gap-1">
              <span className="text-white font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Stream</span>
            </div>
          )}
        </div>
      )}

      {/* Caption Overlay */}
      {showCaptions && !isMini && liveCaption && (
        <div className="absolute bottom-32 left-0 w-full px-10 flex justify-center z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl max-w-[80%] text-center">
            <p className="text-white font-bold text-sm sm:text-lg leading-snug drop-shadow-md italic">
              {liveCaption}
            </p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-30 p-6 text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-white font-bold text-sm mb-2">Signal Lost</h3>
          <p className="text-zinc-400 text-[10px] max-w-[200px] leading-relaxed uppercase tracking-wider font-mono">
            {error}
          </p>
          <button
            onClick={onEnded}
            className="mt-6 px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all pointer-events-auto"
          >
            Back to Browser
          </button>
        </div>
      )}
    </div>
  );
};
