.
├── .cursor
│   └── rules
│       ├── coding-rule.mdc
│       ├── expo-router-testing.mdc
│       ├── jest-mock-lessons.mdc
│       └── jest-testing-guide.mdc
├── .cursorignore
├── .env
├── .env.sample
├── .gitignore
├── README.md
├── app
│   ├── (tabs)
│   │   ├── _layout.tsx
│   │   ├── explore.tsx
│   │   └── index.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── book
│   │   ├── [id].tsx
│   │   └── add-clip.tsx
│   └── clip
│       └── [id].tsx
├── app.json
├── assets
│   ├── fonts
│   │   └── SpaceMono-Regular.ttf
│   └── images
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       └── splash-icon.png
├── babel.config.js
├── components
│   ├── BarcodeScanner.tsx
│   ├── BookItem.tsx
│   ├── BookshelfView.tsx
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── camera
│   │   ├── BarcodeScanner.tsx
│   │   ├── CameraModal.tsx
│   │   ├── ImagePreview.tsx
│   │   └── PermissionRequest.tsx
│   └── ui
│       ├── IconSymbol.ios.tsx
│       ├── IconSymbol.tsx
│       ├── TabBarBackground.ios.tsx
│       └── TabBarBackground.tsx
├── constants
│   ├── Colors.ts
│   └── MockData.ts
├── docs
│   ├── ARCHITECTURE.md
│   ├── DIRECTORY.md
│   ├── PRD.md
│   ├── PRODUCT_OVERVIEW.md
│   └── PROGRESS.md
├── expo-env.d.ts
├── hooks
│   ├── useBookScanner.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── jest.config.js
├── package-lock.json
├── package.json
├── scripts
│   └── reset-project.js
├── services
│   ├── BookStorageService.ts
│   ├── ClipStorageService.ts
│   ├── RakutenBookService.ts
│   └── bookSearch.ts
├── tests
│   ├── __mocks__
│   │   └── @react-native-async-storage
│   │       └── async-storage.js
│   ├── app
│   │   ├── (tabs)
│   │   │   └── index.test.tsx
│   │   ├── book
│   │   │   ├── add-clip.test.tsx
│   │   │   └── book-detail.test.tsx
│   │   └── clip
│   │       └── clip-detail.test.tsx
│   ├── components
│   │   ├── BarcodeScanner.test.tsx
│   │   ├── BookItem.test.tsx
│   │   ├── BookshelfView.test.tsx
│   │   ├── ThemedText-test.tsx
│   │   ├── __snapshots__
│   │   │   └── ThemedText-test.tsx.snap
│   │   └── camera
│   │       ├── BarcodeScanner.test.tsx
│   │       └── CameraModal.test.tsx
│   ├── jest.config.js
│   ├── services
│   │   └── ClipStorageService.test.ts
│   ├── setup.js
│   └── test-utils.tsx
├── tsconfig.json
└── types
    └── env.d.ts

30 directories, 84 files
