import { Asset, Collection, Folder } from '@/types/asset';

// Generate placeholder image URLs with varied colours
const generatePlaceholder = (id: number, width = 400, height = 400) => {
  const colours = [
    '1a1a2e', '16213e', '0f3460', '533483', 
    '2c3e50', '34495e', '7f8c8d', '95a5a6',
    '1e3a5f', '2d4a6a', '3d5a75', '4a6a80'
  ];
  const colour = colours[id % colours.length];
  return `https://via.placeholder.com/${width}x${height}/${colour}/ffffff?text=IMG_${String(id).padStart(4, '0')}`;
};

export const mockAssets: Asset[] = Array.from({ length: 48 }, (_, i) => {
  const id = i + 1;
  const statuses: Asset['status'][] = ['draft', 'editing', 'approved', 'published'];
  const cameras = ['Canon EOS R5', 'Sony A7R IV', 'Nikon Z9', 'Leica M11', 'Fujifilm X-T5'];
  const lenses = ['24-70mm f/2.8', '50mm f/1.4', '85mm f/1.2', '70-200mm f/2.8', '35mm f/1.8'];
  const years = [2020, 2021, 2022, 2023, 2024];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  
  const year = years[Math.floor(Math.random() * years.length)];
  const month = months[Math.floor(Math.random() * months.length)];
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  return {
    id: `asset-${id}`,
    filename: `IMG_${String(id).padStart(4, '0')}.jpg`,
    title: id % 5 === 0 ? `Photo ${id} Title` : undefined,
    type: 'image',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    thumbnailUrl: generatePlaceholder(id),
    originalUrl: generatePlaceholder(id, 2400, 1600),
    width: 2400,
    height: 1600,
    fileSize: Math.floor(Math.random() * 15000000) + 2000000,
    mimeType: 'image/jpeg',
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    lens: lenses[Math.floor(Math.random() * lenses.length)],
    focalLength: `${Math.floor(Math.random() * 150) + 24}mm`,
    aperture: `f/${[1.4, 1.8, 2.8, 4, 5.6, 8][Math.floor(Math.random() * 6)]}`,
    shutterSpeed: `1/${[60, 125, 250, 500, 1000, 2000][Math.floor(Math.random() * 6)]}`,
    iso: [100, 200, 400, 800, 1600, 3200][Math.floor(Math.random() * 6)],
    dateTaken: `${year}-${month}-${day}T${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
    tags: ['landscape', 'nature', 'travel', 'portrait', 'street', 'architecture']
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1),
    collections: ['Favourites', 'Portfolio', 'Recent Edits', 'To Review']
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2)),
    rating: Math.floor(Math.random() * 6),
    colorLabel: Math.random() > 0.7 
      ? (['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const)[Math.floor(Math.random() * 6)]
      : undefined,
    createdAt: `${year}-${month}-${day}T12:00:00Z`,
    updatedAt: new Date().toISOString(),
    publishedAt: statuses[Math.floor(Math.random() * statuses.length)] === 'published' 
      ? new Date().toISOString() 
      : undefined,
  };
});

export const mockCollections: Collection[] = [
  { id: 'col-1', name: 'Favourites', assetCount: 127, isSmartCollection: false, createdAt: '2024-01-15' },
  { id: 'col-2', name: 'Portfolio', assetCount: 45, isSmartCollection: false, createdAt: '2024-02-20' },
  { id: 'col-3', name: 'Recent Edits', assetCount: 23, isSmartCollection: true, createdAt: '2024-03-10' },
  { id: 'col-4', name: 'To Review', assetCount: 89, isSmartCollection: true, createdAt: '2024-03-15' },
  { id: 'col-5', name: 'Client Work', assetCount: 312, isSmartCollection: false, createdAt: '2023-11-08' },
  { id: 'col-6', name: '5-Star Rated', assetCount: 67, isSmartCollection: true, createdAt: '2024-01-01' },
];

export const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Archive',
    path: '/Archive',
    assetCount: 15234,
    children: [
      { id: 'folder-1-1', name: '2024', path: '/Archive/2024', parentId: 'folder-1', assetCount: 2341, children: [] },
      { id: 'folder-1-2', name: '2023', path: '/Archive/2023', parentId: 'folder-1', assetCount: 3456, children: [] },
      { id: 'folder-1-3', name: '2022', path: '/Archive/2022', parentId: 'folder-1', assetCount: 2890, children: [] },
      { id: 'folder-1-4', name: '2021', path: '/Archive/2021', parentId: 'folder-1', assetCount: 2134, children: [] },
    ],
  },
  {
    id: 'folder-2',
    name: 'Film Scans',
    path: '/Film Scans',
    assetCount: 4521,
    children: [
      { id: 'folder-2-1', name: '35mm', path: '/Film Scans/35mm', parentId: 'folder-2', assetCount: 2341, children: [] },
      { id: 'folder-2-2', name: 'Medium Format', path: '/Film Scans/Medium Format', parentId: 'folder-2', assetCount: 1890, children: [] },
    ],
  },
  {
    id: 'folder-3',
    name: 'Working',
    path: '/Working',
    assetCount: 234,
    children: [],
  },
  {
    id: 'folder-4',
    name: 'Published',
    path: '/Published',
    assetCount: 1890,
    children: [],
  },
];

export const stats = {
  totalAssets: 25432,
  totalSize: '1.2 TB',
  drafts: 4521,
  editing: 234,
  approved: 890,
  published: 19787,
};
