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
├── services/
│   ├── iptvService.ts          # Handles fetching and parsing of M3U playlists.
│   ├── activityService.ts      # LocalStorage manager for reviews, likes, and views.
│   └── geminiService.ts        # Smart assistant for optional content analysis.
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

## 🚀 Live Demo

**View the live application:** [https://streambox-phi.vercel.app](https://streambox-phi.vercel.app)

---

## 🛠️ Getting Started

### Local Development
1. **Clone the repo**:
   ```bash
   git clone https://github.com/aadityakamble18/StreamBox.git
   cd StreamBox
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run development server**:
   ```bash
   npm run dev
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```

### 🌍 Deployment (Vercel)
This project is optimized for deployment on **Vercel**. Every push to the `main` branch will automatically trigger a new build.

---

## 🔑 Environment Variables

To enable the AI content analysis features, you need to provide a Google Gemini API Key.

1. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
2. For Vercel, add `GEMINI_API_KEY` in the **Project Settings > Environment Variables** section.

---

---

## 🎖️ Credits & Data Sources

This project leverages the incredible open-source data provided by the IPTV community:
- **IPTV-org**: Channel lists and metadata are sourced from the [iptv-org/iptv](https://github.com/iptv-org/iptv) repository.
- **HLS.js**: Core streaming engine provided by [video-dev/hls.js](https://github.com/video-dev/hls.js).
- **VLC**: UI design language inspired by the [VideoLAN](https://www.videolan.org/vlc/) project.

---

*Engineered for speed. Built for the stream.*
