.
├── .cursor
│   └── rules
│       ├── coding-rule.mdc
│       ├── expo-env-variables.mdc
│       ├── expo-router-testing.mdc
│       ├── jest-mock-lessons.mdc
│       ├── jest-testing-guide.mdc
│       └── unused-variables.mdc
├── .cursorignore
├── .env
├── .env.sample
├── .eslintrc.js
├── .gitignore
├── .ts-prunerc.json
├── README.md
├── app
│   ├── (tabs)
│   │   ├── _layout.tsx
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
│       ├── no-image.svg
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       └── splash-icon.png
├── babel.config.js
├── components
│   ├── BookItem.tsx
│   ├── BookshelfView.tsx
│   ├── CameraView.tsx
│   ├── HapticTab.tsx
│   ├── ImageSelectionView.tsx
│   ├── NoImagePlaceholder.tsx
│   ├── OCRResultView.tsx
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
├── jest.setup.js
├── package-lock.json
├── package.json
├── scripts
│   └── reset-project.js
├── services
│   ├── BookStorageService.ts
│   ├── ClipStorageService.ts
│   ├── OCRService.ts
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
│   │   ├── BookItem.test.tsx
│   │   ├── BookshelfView.test.tsx
│   │   ├── CameraView.test.tsx
│   │   ├── ImageSelectionView.test.tsx
│   │   ├── OCRResultView.test.tsx
│   │   ├── ParallaxScrollView.test.tsx
│   │   ├── ThemedText-test.tsx
│   │   ├── __snapshots__
│   │   │   └── ThemedText-test.tsx.snap
│   │   └── camera
│   │       ├── BarcodeScanner.test.tsx
│   │       └── CameraModal.test.tsx
│   ├── hooks
│   │   └── useBookScanner.test.tsx
│   ├── services
│   │   ├── ClipStorageService.test.ts
│   │   └── OCRService.test.ts
│   ├── setup.js
│   └── test-utils.tsx
├── tsconfig.json
└── types
    └── env.d.ts

31 directories, 94 files
