export interface Activity {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string;
  date: string;
  location: string;
  price: number;
  duration: string;
  difficulty: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutData {
  title: string;
  content: string;
  image: string;
}

export interface ContactData {
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
} 