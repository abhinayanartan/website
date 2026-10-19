const fs = require('fs');
const path = require('path');

const years = ['2026', '2025', '2024', '2023', '2022', '2021'];
const mediaDir = path.join(process.cwd(), 'videos and photos');

const framesPattern = [
  'big',      // 0: big featured 2x2 frame
  'standard', // 1: 1x1
  'tall',     // 2: 1x2 portrait
  'standard', // 3: 1x1
  'wide',     // 4: 2x1 landscape
  'standard', // 5: 1x1
  'standard', // 6: 1x1
  'tall',     // 7: 1x2 portrait
  'wide',     // 8: 2x1 landscape
  'standard', // 9: 1x1
  'standard', // 10: 1x1
  'big',      // 11: big featured 2x2 frame
];

const yearGalleries = [];

for (const year of years) {
  const dir = path.join(mediaDir, year);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir);

  const photos = files
    .filter((f) => f.toLowerCase().endsWith('.jpg'))
    .map((f) => {
      const match = f.match(/p(\d+)/i);
      const num = match ? parseInt(match[1], 10) : 0;
      return { filename: f, num, type: 'photo' };
    })
    .sort((a, b) => a.num - b.num);

  const videos = files
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .map((f) => {
      const match = f.match(/v(\d+)/i);
      const num = match ? parseInt(match[1], 10) : 0;
      return { filename: f, num, type: 'video' };
    })
    .sort((a, b) => a.num - b.num);

  const items = [];
  let pIdx = 0;
  let vIdx = 0;
  const totalP = photos.length;
  const totalV = videos.length;

  // Interleave photos and videos smoothly
  const ratio = totalV > 0 ? Math.max(1, Math.round(totalP / totalV)) : totalP + 1;

  while (pIdx < totalP || vIdx < totalV) {
    for (let r = 0; r < ratio && pIdx < totalP; r++) {
      items.push(photos[pIdx++]);
    }
    if (vIdx < totalV) {
      items.push(videos[vIdx++]);
    }
  }

  const mappedItems = items.map((item, idx) => {
    let frame = framesPattern[idx % framesPattern.length];
    if (items.length <= 7 && frame === 'big') {
      frame = 'wide';
    }

    return {
      id: `${year}-${item.type === 'video' ? 'v' : 'p'}${item.num}`,
      year,
      type: item.type,
      filename: item.filename,
      src: `/gallery/${year}/${encodeURIComponent(item.filename)}`,
      title: `${year} • ${item.type === 'video' ? 'Video' : 'Photo'} ${item.num}`,
      frame,
      number: item.num,
    };
  });

  yearGalleries.push({
    year,
    title: `${year} Classical Archive`,
    totalPhotos: totalP,
    totalVideos: totalV,
    items: mappedItems,
  });
}

const allItems = yearGalleries.flatMap((g) => g.items);

const fileContent = `// Auto-generated gallery catalog from videos and photos/
export type MediaType = "photo" | "video";
export type FrameType = "big" | "wide" | "tall" | "standard";

export interface MediaItem {
  id: string;
  year: string;
  type: MediaType;
  filename: string;
  src: string;
  title: string;
  frame: FrameType;
  number: number;
}

export interface YearGallery {
  year: string;
  title: string;
  totalPhotos: number;
  totalVideos: number;
  items: MediaItem[];
}

export const galleryData: YearGallery[] = ${JSON.stringify(yearGalleries, null, 2)};

export const allGalleryItems: MediaItem[] = galleryData.flatMap((g) => g.items);

export const galleryStats = {
  totalYears: galleryData.length,
  totalItems: allGalleryItems.length,
  totalPhotos: allGalleryItems.filter((it) => it.type === "photo").length,
  totalVideos: allGalleryItems.filter((it) => it.type === "video").length,
  years: galleryData.map((g) => g.year),
};
`;

fs.writeFileSync(path.join(process.cwd(), 'lib', 'galleryData.ts'), fileContent, 'utf8');
console.log('Successfully generated lib/galleryData.ts with', allItems.length, 'items across', yearGalleries.length, 'years.');

