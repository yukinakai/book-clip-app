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
│   │   ├── add-clip.tsx
│   │   └── edit.tsx
│   ├── clip
│   │   └── [id].tsx
│   ├── onboarding.tsx
│   └── reset.tsx
├── app.config.js
├── app.json
├── assets
│   ├── fonts
│   │   └── SpaceMono-Regular.ttf
│   └── images
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       ├── no-image.svg
│       ├── onboarding-barcode.svg
│       ├── onboarding-camera.svg
│       ├── onboarding-search.svg
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       └── splash-icon.png
├── babel.config.cjs
├── components
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
├── eslint.config.js
├── expo-env.d.ts
├── hooks
│   ├── useBookScanner.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── jest.config.cjs
├── jest.setup.cjs
├── package-lock.json
├── package.json
├── scripts
│   ├── reset-onboarding-simple.js
│   ├── reset-onboarding.cjs
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
│   │   │   ├── book-detail.test.tsx
│   │   │   └── edit.test.tsx
│   │   └── clip
│   │       └── clip-detail.test.tsx
│   ├── components
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
│   │   ├── BookStorageService.test.ts
│   │   ├── ClipStorageService.test.ts
│   │   └── OCRService.test.ts
│   ├── setup.js
│   └── test-utils.tsx
├── tsconfig.json
└── types
    └── env.d.ts

31 directories, 103 files
