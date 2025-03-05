.
├── .clineignore
├── .clinerules
├── .env
├── .env.sample
├── .gitignore
├── PROGRESS.md
├── README.md
├── __mocks__
│   └── fileMock.ts
├── app.config.ts
├── docs
│   ├── ARCHITECTURE.md
│   ├── DIRECTORY.md
│   ├── PRD.md
│   └── PRODUCT_OVERVIEW.md
├── jest.config.js
├── jest.setup.js
├── package-lock.json
├── package.json
├── src
│   ├── __mocks__
│   │   ├── @tanstack
│   │   │   └── react-query.ts
│   │   └── expo-router.tsx
│   ├── app
│   │   ├── (auth)
│   │   │   ├── __tests__
│   │   │   │   ├── sign-in.test.tsx
│   │   │   │   └── sign-up.test.tsx
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   ├── (tabs)
│   │   │   ├── [id].tsx
│   │   │   ├── __tests__
│   │   │   │   ├── [id].test.tsx
│   │   │   │   └── scan.test.tsx
│   │   │   ├── _layout.tsx
│   │   │   ├── explore.tsx
│   │   │   ├── index.tsx
│   │   │   └── scan.tsx
│   │   ├── +not-found.tsx
│   │   └── _layout.tsx
│   ├── app.json
│   ├── assets
│   │   ├── fonts
│   │   │   └── SpaceMono-Regular.ttf
│   │   └── images
│   │       ├── adaptive-icon.png
│   │       ├── book-placeholder.png
│   │       ├── book-placeholder.svg
│   │       ├── book-placeholder@2x.png
│   │       ├── book-placeholder@3x.png
│   │       ├── favicon.png
│   │       ├── icon.png
│   │       ├── partial-react-logo.png
│   │       ├── react-logo.png
│   │       ├── react-logo@2x.png
│   │       ├── react-logo@3x.png
│   │       └── splash-icon.png
│   ├── components
│   │   ├── BarcodeScanner.tsx
│   │   ├── ParallaxScrollView.tsx
│   │   ├── __tests__
│   │   │   ├── BarcodeScanner.test.tsx
│   │   │   └── ParallaxScrollView.test.tsx
│   │   ├── auth
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── __tests__
│   │   │       ├── SignInForm.test.tsx
│   │   │       └── SignUpForm.test.tsx
│   │   ├── books
│   │   │   ├── BookList.tsx
│   │   │   └── __tests__
│   │   │       └── BookList.test.tsx
│   │   ├── tags
│   │   │   ├── TagForm.tsx
│   │   │   ├── TagList.tsx
│   │   │   └── __tests__
│   │   │       ├── TagForm.test.tsx
│   │   │       └── TagList.test.tsx
│   │   └── ui
│   │       ├── Dialog.tsx
│   │       ├── IconSymbol.tsx
│   │       ├── ThemedText.tsx
│   │       ├── ThemedView.tsx
│   │       ├── __mocks__
│   │       │   └── @expo
│   │       │       └── vector-icons.tsx
│   │       └── __tests__
│   │           ├── IconSymbol.test.tsx
│   │           ├── ThemedText.test.tsx
│   │           └── ThemedView.test.tsx
│   ├── contexts
│   │   ├── AuthProvider.tsx
│   │   └── __tests__
│   │       └── AuthProvider.test.tsx
│   ├── hooks
│   │   ├── __mocks__
│   │   │   └── useColorScheme.ts
│   │   ├── __tests__
│   │   │   ├── useAuth.test.ts
│   │   │   └── useWindowDimensions.test.ts
│   │   ├── useAuth.ts
│   │   ├── useColorScheme.ts
│   │   └── useWindowDimensions.ts
│   ├── lib
│   │   ├── __mocks__
│   │   │   └── supabase.ts
│   │   ├── __tests__
│   │   │   ├── books.test.ts
│   │   │   └── tags.test.ts
│   │   ├── books.ts
│   │   ├── quotes.ts
│   │   ├── supabase.ts
│   │   └── tags.ts
│   └── types
│       ├── book.ts
│       ├── quote.ts
│       └── tag.ts
└── tsconfig.json

35 directories, 87 files
