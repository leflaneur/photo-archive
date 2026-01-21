export type AssetStatus = 'draft' | 'editing' | 'approved' | 'published';

export type AssetType = 'image' | 'video' | 'document';

export interface Asset {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  type: AssetType;
  status: AssetStatus;
  thumbnailUrl: string;
  originalUrl: string;
  
  // Metadata
  width?: number;
  height?: number;
  fileSize: number;
  mimeType: string;
  
  // EXIF data
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  dateTaken?: string;
  
  // Organization
  tags: string[];
  collections: string[];
  rating: number; // 0-5
  colorLabel?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
  coverAssetId?: string;
  isSmartCollection: boolean;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  assetCount: number;
  children: Folder[];
}
