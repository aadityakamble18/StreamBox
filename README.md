# 📡 StreamBox

StreamBox is a high-performance, web-native media player designed for the modern streaming era. Inspired by the versatility of VLC but optimized for the web, it offers a cinematic experience for browsing and watching thousands of live IPTV channels with zero-latency transitions.

## 🌟 Key Features

### 📺 High-Performance Streaming
- **Persistent Playback Lifecycle**: Seamlessly transition from full-screen viewing to a floating mini-player. The stream never stops, and the HLS buffer remains active during UI shifts.
- **Advanced HLS Integration**: Powered by `hls.js` with custom buffer management, auto-recovery, and adaptive bitrate switching for a stutter-free experience.
- **Global Channel Browser**: Instantly access and filter thousands of channels from the IPTV-org index.

### 🎨 Premium UI/UX (VLC Inspired)
- **Cinematic Controls**: A high-contrast, glassmorphism-based interface that prioritizes content. Controls intelligently fade out during inactivity.
- **Mini-Player Mode**: A "Picture-in-Picture" style implementation that allows you to continue watching while you browse other categories or read reviews.
- **Adaptive Grid**: A high-speed, searchable grid. Optimized for mobile with a responsive two-column layout on small screens.

### 💬 Community & Social Discovery
- **Live Rating & Reviews**: A built-in feedback system where you can rate channels (1-10) and read community reviews directly in the player.
- **Trending Metrics**: Real-time tracking of views, likes, and overall channel popularity (stored locally).
- **One-Click Sharing**: Share favorite streams instantly via the native Web Share API.

---

## 📂 Project Structure

```text
StreamBox/
├── components/
│   ├── IPTVBrowser.tsx         # Discovery hub with responsive grid.
│   ├── MediaScreen.tsx         # Core video engine (HLS.js).
│   ├── PlayerOverlay.tsx       # Cinematic HUD controls.
│   ├── ChannelDetailsModal.tsx # Social feedback and stats.
├── services/
│   ├── iptvService.ts          # M3U playlist fetching and parsing.
│   └── activityService.ts      # LocalStorage manager for social data.
├── types.ts                    # Central TypeScript interfaces.
├── App.tsx                     # Main application orchestrator.
├── index.tsx                   # React entry point.
├── index.html                  # HTML5 template.
├── constants.tsx               # Design tokens and icons.
└── metadata.json               # Application manifest.
```

---

## 🛠️ Technical Deep-Dive

### The "Continuous Stream" Architecture
Standard web applications often re-mount components when changing views, which causes video streams to restart. StreamBox avoids this by placing the `MediaScreen` component at the root. When switching to "Mini-Player" mode, the player simply animates to the corner, maintaining the active HLS buffer.

### Local Social State
To maintain a "live" feel without a backend, the `activityService` utilizes `LocalStorage`. This allows personal ratings, view history, and community interactions to persist across browser sessions.

---

## 🎖️ Credits & Data Sources

- **IPTV-org**: Data sourced from [iptv-org/iptv](https://github.com/iptv-org/iptv).
- **HLS.js**: Core engine by [video-dev/hls.js](https://github.com/video-dev/hls.js).
- **VLC**: UI design language inspired by the [VideoLAN](https://www.videolan.org/vlc/) project.

---

*Engineered for speed. Built for the stream.*