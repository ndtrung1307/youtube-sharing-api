import { youtubeURLRegex } from '../regex';

export function extractVideoId(url: string): string | null {
  const match = url.match(youtubeURLRegex);
  return match ? match[match.length - 1] : null;
}
