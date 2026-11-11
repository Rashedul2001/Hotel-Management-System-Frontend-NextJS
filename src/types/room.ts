export interface RoomAmenity {
  id: number;
  name: string;
  publicId?: string;
}

export interface RoomImage {
  id: number;
  imageUrl: string;
  publicId?: string;
}

export type RoomStatus =
  | "Available"
  | "Occupied"
  | "Cleaning"
  | "Maintenance"
  | "Blocked";

export interface Room {
  id: string;
  roomNumber: number | string;
  name: string;
  category: string;
  floor: number;
  status: RoomStatus | string;
  isFeatured?: boolean;
  price: number;
  capacity: number;
  bedCount: number;
  bedType: string;
  size: number;
  description: string;
  createdAt: string;
  updatedAt?: string;
  UpdatedAt?: string;
  averageRating: number;
  totalReviews: number;
  images: RoomImage[];
  amenities: RoomAmenity[];
}

export interface RoomSummaryCounts {
  total: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  blocked: number;
}

export interface RoomListResponse {
  totalRooms: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  rooms: Room[];
  summaryCounts?: RoomSummaryCounts;
}
