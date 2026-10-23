const fs = require('fs');
const path = require('path');

const years = ['2026', '2025', '2024', '2023', '2022', '2021'];
const publicGalleryDir = path.join(process.cwd(), 'public', 'gallery');
const rawMediaDir = path.join(process.cwd(), 'videos and photos');

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
const auditResults = {
  totalPhotosAudited: 0,
  totalVideosCounted: 0,
  missingAssets: [],
  invalidAssets: [],
  years: {},
};

for (const year of years) {
  const yearDir = path.join(publicGalleryDir, year);
  if (!fs.existsSync(yearDir)) {
    console.warn(`[WARN] Gallery directory missing for year ${year}`);
    continue;
  }

  // Audit and collect valid photos from public/gallery
  const files = fs.readdirSync(yearDir);
  const photoFiles = files.filter((f) => f.toLowerCase().endsWith('.jpg'));

  // Sort photos by original filename index if present
  const parsedPhotos = photoFiles
    .map((f) => {
      const match = f.match(/p(\d+)/i);
      const fileNum = match ? parseInt(match[1], 10) : 0;
      const fullPath = path.join(yearDir, f);
      const buf = fs.readFileSync(fullPath);
      const isJpeg = buf.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
      if (!isJpeg) {
        auditResults.invalidAssets.push({
          year,
          filename: f,
          header: buf.slice(4, 12).toString('ascii'),
        });
      }
      return { filename: f, fileNum, isValid: isJpeg };
    })
    .sort((a, b) => a.fileNum - b.fileNum);

  // Check for unavailable assets in original file number sequence (e.g. 2025 p12)
  if (parsedPhotos.length > 0) {
    const minNum = parsedPhotos[0].fileNum;
    const maxNum = parsedPhotos[parsedPhotos.length - 1].fileNum;
    const existingFileNums = new Set(parsedPhotos.map((p) => p.fileNum));

    for (let expected = minNum; expected <= maxNum; expected++) {
      if (!existingFileNums.has(expected)) {
        const missingFilename = `${year} p${expected}.jpg`;
        auditResults.missingAssets.push({
          year,
          expectedFile: missingFilename,
          reason: 'Asset genuinely unavailable on disk',
        });
      }
    }
  }

  // Map each valid photo item with strictly sequential numbering (1..N) based on available assets
  const validPhotos = parsedPhotos.filter((p) => p.isValid);
  const mappedPhotos = validPhotos.map((item, idx) => {
    const sequentialNum = idx + 1;
    let frame = framesPattern[idx % framesPattern.length];
    if (validPhotos.length <= 7 && frame === 'big') {
      frame = 'wide';
    }

    return {
      id: `${year}-p${sequentialNum}`,
      year,
      type: 'photo',
      filename: item.filename,
      src: `/gallery/${year}/${encodeURIComponent(item.filename)}`,
      title: `${year} \u2022 Photo ${sequentialNum}`,
      alt: `Abhinaya Nartan Kuchipudi classical dance performance - ${year} Photo ${sequentialNum}`,
      frame,
      number: sequentialNum,
    };
  });

  // Count accurate video assets from videos and photos archive
  let videoCount = 0;
  const rawYearDir = path.join(rawMediaDir, year);
  if (fs.existsSync(rawYearDir)) {
    const rawFiles = fs.readdirSync(rawYearDir);
    videoCount = rawFiles.filter((f) => f.toLowerCase().endsWith('.mp4')).length;
  }

  auditResults.totalPhotosAudited += mappedPhotos.length;
  auditResults.totalVideosCounted += videoCount;
  auditResults.years[year] = {
    photos: mappedPhotos.length,
    videos: videoCount,
  };

  yearGalleries.push({
    year,
    title: `${year} Classical Archive`,
    totalPhotos: mappedPhotos.length,
    totalVideos: videoCount,
    items: mappedPhotos,
  });
}

const allItems = yearGalleries.flatMap((g) => g.items);

const fileContent = `// Auto-generated gallery catalog from public/gallery and videos and photos/
export type MediaType = "photo" | "video";
export type FrameType = "big" | "wide" | "tall" | "standard";

export interface MediaItem {
  id: string;
  year: string;
  type: MediaType;
  filename: string;
  src: string;
  title: string;
  alt?: string;
  frame: FrameType;
  number: number;
  unavailable?: boolean;
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
  totalVideos: galleryData.reduce((acc, g) => acc + g.totalVideos, 0),
  years: galleryData.map((g) => g.year),
};
`;

fs.writeFileSync(path.join(process.cwd(), 'lib', 'galleryData.ts'), fileContent, 'utf8');

console.log('--- GALLERY AUDIT SUMMARY ---');
console.log(`Audited ${auditResults.totalPhotosAudited} valid photos across ${yearGalleries.length} years.`);
console.log(`Documented ${auditResults.totalVideosCounted} future recital film archive videos.`);
console.log('Year Breakdown:', JSON.stringify(auditResults.years, null, 2));
if (auditResults.missingAssets.length > 0) {
  console.log('Unavailable Assets:', JSON.stringify(auditResults.missingAssets, null, 2));
} else {
  console.log('No unavailable assets detected.');
}
if (auditResults.invalidAssets.length > 0) {
  console.log('Invalid Format Assets:', JSON.stringify(auditResults.invalidAssets, null, 2));
} else {
  console.log('All image assets validated as standard JPEG.');
}
console.log('Successfully generated lib/galleryData.ts.');
