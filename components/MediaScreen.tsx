
import React, { useEffect, useState, useRef } from 'react';
import { MediaItem } from '../types';
import Hls from 'hls.js';

interface MediaScreenProps {
  media: MediaItem | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onEnded: () => void;
  isMini?: boolean;
}

export const MediaScreen: React.FC<MediaScreenProps> = ({ media, videoRef, onEnded, isMini = false }) => {
  const [isBuffering, setIsBuffering] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media) return;

    // Reset state
    setIsBuffering(true);

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
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          manifestLoadingMaxRetry: 4,
          levelLoadingMaxRetry: 4,
          fragLoadingMaxRetry: 4,
          startLevel: -1,
        });

        hls.loadSource(media.url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.error("Playback failed", e));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
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

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onLoadStart = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      cleanupHls();
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [media, videoRef]);

  if (!media) return null;

  return (
    <div className="h-full w-full bg-black flex items-center justify-center overflow-hidden relative">
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        onEnded={onEnded}
        autoPlay
        playsInline
        crossOrigin="anonymous"
      />

      {isBuffering && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] z-20 pointer-events-none transition-opacity duration-300`}>
          <div className={`${isMini ? 'w-8 h-8 border-2' : 'w-16 h-16 border-4'} border-orange-500/20 border-t-orange-500 rounded-full animate-spin`}></div>
          {!isMini && (
            <div className="mt-6 flex flex-col items-center gap-1">
              <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">
                Optimizing Stream
              </span>
              <span className="text-zinc-500 text-[9px] uppercase font-mono">
                Adjusting buffer...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
