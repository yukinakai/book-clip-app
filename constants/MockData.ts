export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: any; // string for image URLs
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://covers.openlibrary.org/b/id/8231432-M.jpg',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: 'https://covers.openlibrary.org/b/id/8540755-M.jpg',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://covers.openlibrary.org/b/id/8575741-M.jpg',
  },
  {
    id: '4',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverImage: 'https://covers.openlibrary.org/b/id/8739161-M.jpg',
  },
  {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverImage: 'https://covers.openlibrary.org/b/id/12003752-M.jpg',
  },
  {
    id: '6',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://covers.openlibrary.org/b/id/6499299-M.jpg',
  },
  {
    id: '7',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    coverImage: 'https://covers.openlibrary.org/b/id/8127193-M.jpg',
  },
  {
    id: '8',
    title: 'Animal Farm',
    author: 'George Orwell',
    coverImage: 'https://covers.openlibrary.org/b/id/6741565-M.jpg',
  },
  {
    id: '9',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverImage: 'https://covers.openlibrary.org/b/id/8380881-M.jpg',
  },
];
