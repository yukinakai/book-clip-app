export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: any; // string for image URLs
}

export interface Clip {
  id: string;
  bookId: string;
  text: string;
  page: number;
  createdAt: string;
}
