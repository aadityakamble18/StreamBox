
import { IPTVChannel } from '../types';

export async function fetchIPTVChannels(): Promise<IPTVChannel[]> {
  const url = 'https://iptv-org.github.io/iptv/index.m3u';
  try {
    const response = await fetch(url);
    const text = await response.text();

    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./m3uWorker.js', import.meta.url));
      worker.onmessage = (e) => {
        resolve(e.data);
        worker.terminate();
      };
      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };
      worker.postMessage({ content: text });
    });
  } catch (error) {
    console.error("Failed to fetch IPTV channels:", error);
    return [];
  }
}

function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split('\n');
  const channels: IPTVChannel[] = [];
  let currentChannel: Partial<IPTVChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Extract name (usually after the last comma)
      const nameMatch = line.match(/,(.*)$/);
      currentChannel.name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';

      // Extract logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      currentChannel.logo = logoMatch ? logoMatch[1] : '';

      // Extract group (Genre)
      const groupMatch = line.match(/group-title="([^"]*)"/);
      currentChannel.group = groupMatch ? groupMatch[1] : 'General';

      // Extract country
      const countryMatch = line.match(/tvg-country="([^"]*)"/);
      currentChannel.country = countryMatch ? countryMatch[1] : 'Global';

      // Extract language
      const langMatch = line.match(/tvg-language="([^"]*)"/);
      currentChannel.language = langMatch ? langMatch[1] : 'Multilingual';
    } else if (line.startsWith('http')) {
      currentChannel.url = line;
      if (currentChannel.name && currentChannel.url) {
        channels.push({
          name: currentChannel.name,
          logo: currentChannel.logo || '',
          url: currentChannel.url,
          group: currentChannel.group || 'General',
          country: currentChannel.country || 'Global',
          language: currentChannel.language || 'Multilingual'
        });
      }
      currentChannel = {};
    }
  }

  return channels;
}
