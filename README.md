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
- **Adaptive Grid**: A high-speed, searchable grid capable of rendering hundreds of items with smooth performance.

### 💬 Community & Social Discovery
- **Live Rating & Reviews**: A built-in feedback system where you can rate channels (1-10) and read community reviews directly in the player.
- **Trending Metrics**: Real-time tracking of views, likes, and overall channel popularity (stored locally).
- **One-Click Sharing**: Share your favorite streams instantly via the native Web Share API or quick-copy to clipboard.

---

## 📂 Project Structure

```text
StreamBox/
├── components/
│   ├── IPTVBrowser.tsx         # The main discovery hub; handles filtering and sorting.
│   ├── MediaScreen.tsx         # The core video engine; manages HLS.js lifecycle.
│   ├── PlayerOverlay.tsx       # The "VLC-style" HUD with playback and share controls.
│   ├── ChannelDetailsModal.tsx # Social hub for ratings, reviews, and channel stats.
│   └── MenuBar.tsx             # [Legacy] UI is now integrated into the modern HUD.
├── services/
│   ├── iptvService.ts          # Handles fetching and parsing of M3U playlists.
│   ├── activityService.ts      # LocalStorage manager for reviews, likes, and views.
│   └── geminiService.ts        # Optional smart assistant for content analysis.
├── types.ts                    # Centralized TypeScript interfaces for the entire app.
├── App.tsx                     # The orchestrator; manages persistent player state.
├── index.tsx                   # React entry point.
├── index.html                  # Main HTML template with CDN dependencies.
├── constants.tsx               # Brand colors and shared SVG icons.
└── metadata.json               # Application manifest and permissions.
```

---

## 🛠️ Technical Deep-Dive

### The "Continuous Stream" Architecture
Standard web applications often re-mount components when changing views, which causes video streams to restart. StreamBox avoids this by placing the `MediaScreen` component at the root of the application. When switching to "Mini-Player" mode, the player doesn't reload; it simply animates to a fixed position in the corner of the screen using Tailwind CSS transitions, maintaining the active HLS buffer.

### Local Social State
To maintain a "live" feel without a backend, the `activityService` utilizes a centralized `LocalStorage` store. This allows your personal ratings, view history, and community interactions to persist across browser sessions.

## 🚀 Getting Started

1. **Serve**: This app uses standard ES modules. Simply serve the root directory using any modern web server (e.g., `npx serve` or Live Server).
2. **Browsing**: Use the left sidebar to filter channels by category.
3. **Playing**: Click any channel to start the cinematic playback.
4. **Mini-Player**: Click "Minimize" in the top left of the player to continue watching while browsing.

---

*Engineered for speed. Built for the stream.*
