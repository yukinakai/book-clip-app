export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: any; // For local images or string for URLs
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: require('../assets/images/mock/book1.jpg'),
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: require('../assets/images/mock/book2.jpg'),
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    coverImage: require('../assets/images/mock/book3.jpg'),
  },
  {
    id: '4',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverImage: require('../assets/images/mock/book4.jpg'),
  },
  {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverImage: require('../assets/images/mock/book5.jpg'),
  },
  {
    id: '6',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: require('../assets/images/mock/book6.jpg'),
  },
  {
    id: '7',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    coverImage: require('../assets/images/mock/book7.jpg'),
  },
  {
    id: '8',
    title: 'Animal Farm',
    author: 'George Orwell',
    coverImage: require('../assets/images/mock/book8.jpg'),
  },
  {
    id: '9',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverImage: require('../assets/images/mock/book9.jpg'),
  },
];
