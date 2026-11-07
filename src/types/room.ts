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
  isAvailable: boolean;
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
