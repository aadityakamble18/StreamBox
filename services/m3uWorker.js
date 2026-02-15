
self.onmessage = (e) => {
    const { content } = e.data;
    const lines = content.split('\n');
    const channels = [];
    let currentChannel = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#EXTINF:')) {
            const nameMatch = line.match(/,(.*)$/);
            currentChannel.name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';

            const logoMatch = line.match(/tvg-logo="([^"]*)"/);
            currentChannel.logo = logoMatch ? logoMatch[1] : '';

            const groupMatch = line.match(/group-title="([^"]*)"/);
            currentChannel.group = groupMatch ? groupMatch[1] : 'General';

            const countryMatch = line.match(/tvg-country="([^"]*)"/);
            currentChannel.country = countryMatch ? countryMatch[1] : 'Global';

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

    self.postMessage(channels);
};
