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

// モックデータは内部でのみ使用するためエクスポートしない
const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "https://covers.openlibrary.org/b/id/8231432-M.jpg",
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverImage: "https://covers.openlibrary.org/b/id/8540755-M.jpg",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    coverImage: "https://covers.openlibrary.org/b/id/8575741-M.jpg",
  },
  {
    id: "4",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    coverImage: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
  },
  {
    id: "5",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverImage: "https://covers.openlibrary.org/b/id/12003752-M.jpg",
  },
  {
    id: "6",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverImage: "https://covers.openlibrary.org/b/id/6499299-M.jpg",
  },
  {
    id: "7",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    coverImage: "https://covers.openlibrary.org/b/id/8127193-M.jpg",
  },
  {
    id: "8",
    title: "Animal Farm",
    author: "George Orwell",
    coverImage: "https://covers.openlibrary.org/b/id/6741565-M.jpg",
  },
  {
    id: "9",
    title: "The Alchemist",
    author: "Paulo Coelho",
    coverImage: "https://covers.openlibrary.org/b/id/8380881-M.jpg",
  },
  {
    id: "10",
    title: "人間失格",
    author: "太宰 治",
    coverImage: "https://covers.openlibrary.org/b/id/8231922-M.jpg",
  },
  {
    id: "11",
    title: "ノルウェイの森",
    author: "村上 春樹",
    coverImage: "https://covers.openlibrary.org/b/id/8903380-M.jpg",
  },
  {
    id: "12",
    title: "風の谷のナウシカ",
    author: "宮崎 駿",
    coverImage: "https://covers.openlibrary.org/b/id/6930658-M.jpg",
  },
  {
    id: "13",
    title: "君の名は。",
    author: "新海 誠",
    coverImage: "https://covers.openlibrary.org/b/id/10240242-M.jpg",
  },
  {
    id: "14",
    title: "三体",
    author: "劉 慈欣",
    coverImage: "https://covers.openlibrary.org/b/id/12970962-M.jpg",
  },
];

// モッククリップデータ
const MOCK_CLIPS: Clip[] = [
  {
    id: "1",
    bookId: "1",
    text: "彼女の声は、いつも以上に低く、そして優しかった。まるで風の中でささやくように。",
    page: 42,
    createdAt: "2023-06-15T10:30:00Z",
  },
  {
    id: "2",
    bookId: "1",
    text: "過去は過去として受け入れなければならない。しかし未来は、まだ書き換えることができる。",
    page: 78,
    createdAt: "2023-06-18T14:25:00Z",
  },
  {
    id: "3",
    bookId: "1",
    text: "星空の下で彼は初めて本当の自分を見つけた気がした。",
    page: 102,
    createdAt: "2023-06-20T22:15:00Z",
  },
  {
    id: "4",
    bookId: "2",
    text: "真実は時に最も単純な言葉の中に隠されている。",
    page: 55,
    createdAt: "2023-07-05T09:10:00Z",
  },
  {
    id: "5",
    bookId: "2",
    text: "勇気とは、恐れがないことではなく、恐れがあってもそれを乗り越えて行動することだ。",
    page: 127,
    createdAt: "2023-07-08T16:45:00Z",
  },
];
