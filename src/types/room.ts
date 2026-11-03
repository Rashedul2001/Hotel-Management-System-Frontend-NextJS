export interface RoomAmenity {
  id: number;
  name: string;
}
export interface RoomImage {
  id: number;
  imageUrl: string;
}
export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  category: string;
  floor: number;
  status: string;
  isAvailable: boolean;
  isFeatured: boolean;
  price: number;
  capacity: number;
  bedCount: number;
  bedType: string;
  size: number;
  description: string;
  createdAt: string;
  UpdatedAt: string;
  averageRating: number;
  totalReviews: number;
  images: RoomImage[];
  amenities: RoomAmenity[];
}

