.
├── .cursor
│   └── rules
│       ├── coding-rule.mdc
│       ├── expo-env-variables.mdc
│       ├── expo-router-testing.mdc
│       ├── jest-mock-lessons.mdc
│       ├── jest-testing-guide.mdc
│       ├── react-hooks-testing.mdc
│       └── unused-variables.mdc
├── .cursorignore
├── .env
├── .env.sample
├── .gitignore
├── .ts-prunerc.json
├── README.md
├── app
│   ├── (auth)
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)
│   │   ├── _layout.tsx
│   │   ├── add-clip-tab.tsx
│   │   ├── index.tsx
│   │   └── others.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── book
│   │   ├── [id].tsx
│   │   ├── add-clip.tsx
│   │   ├── edit.tsx
│   │   └── select.tsx
│   ├── camera
│   │   ├── _layout.tsx
│   │   └── ocr.tsx
│   ├── clip
│   │   └── [id].tsx
│   └── onboarding.tsx
├── app.config.js
├── app.json
├── assets
│   ├── fonts
│   │   └── SpaceMono-Regular.ttf
│   └── images
│       ├── adaptive-icon.png
│       ├── bookclip-splash-icon-dark.svg
│       ├── bookclip-splash-icon.svg
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
│       ├── splash-icon-dark.png
│       └── splash-icon.png
├── babel.config.cjs
├── components
│   ├── AuthWrapper.tsx
│   ├── BookshelfView.tsx
│   ├── CameraView.tsx
│   ├── DataMigrationConfirmDialog.tsx
│   ├── DataMigrationProgress.tsx
│   ├── HapticTab.tsx
│   ├── ImageSelectionView.tsx
│   ├── NoImagePlaceholder.tsx
│   ├── OCRResultView.tsx
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── WithdrawConfirmDialog.tsx
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
├── contexts
│   ├── AuthContext.tsx
│   └── LastClipBookContext.tsx
├── docs
│   ├── ARCHITECTURE.md
│   ├── DIRECTORY.md
│   ├── PRD.md
│   ├── PRODUCT_OVERVIEW.md
│   ├── PROGRESS.md
│   ├── specifications
│   │   └── AUTH_DATA_MIGRATION.md
│   └── tests
│       └── AUTH_DATA_MIGRATION_E2E.md
├── eslint.config.js
├── expo-env.d.ts
├── hooks
│   ├── useAuth.ts
│   ├── useBookScanner.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── jest.config.cjs
├── jest.setup.cjs
├── package-lock.json
├── package.json
├── scripts
│   ├── convert-svg-to-png.js
│   ├── reset-project.js
│   └── reset-walkthrough.js
├── services
│   ├── BookStorageService.ts
│   ├── ClipStorageService.ts
│   ├── LocalStorageService.ts
│   ├── OCRService.ts
│   ├── RakutenBookService.ts
│   ├── StorageMigrationService.ts
│   ├── SupabaseStorageService.ts
│   ├── auth.ts
│   └── bookSearch.ts
├── supabase
│   ├── .temp
│   │   ├── cli-latest
│   │   ├── gotrue-version
│   │   ├── pooler-url
│   │   ├── postgres-version
│   │   ├── project-ref
│   │   └── rest-version
│   ├── functions
│   │   ├── README.md
│   │   └── delete-account
│   │       ├── deno.json
│   │       ├── deno.lock
│   │       └── index.ts
│   └── supabase
│       ├── .temp
│       └── supabase
│           ├── .temp
│           └── functions
├── tests
│   ├── __mocks__
│   │   ├── @react-native-async-storage
│   │   │   └── async-storage.js
│   │   └── @supabase
│   │       └── supabase-js.ts
│   ├── app
│   │   ├── (auth)
│   │   │   └── login.test.tsx
│   │   ├── (tabs)
│   │   │   ├── index.test.tsx
│   │   │   └── others.test.tsx
│   │   ├── book
│   │   │   ├── add-clip.test.tsx
│   │   │   ├── book-detail.test.tsx
│   │   │   ├── edit.test.tsx
│   │   │   └── select.test.tsx
│   │   ├── camera
│   │   │   └── ocr.test.tsx
│   │   └── clip
│   │       └── clip-detail.test.tsx
│   ├── components
│   │   ├── AuthWrapper.test.tsx
│   │   ├── BookshelfView.test.tsx
│   │   ├── CameraView.test.tsx
│   │   ├── DataMigrationConfirmDialog.test.tsx
│   │   ├── DataMigrationProgress.test.tsx
│   │   ├── ImageSelectionView.test.tsx
│   │   ├── OCRResultView.test.tsx
│   │   ├── ParallaxScrollView.test.tsx
│   │   ├── ThemedText-test.tsx
│   │   ├── WithdrawConfirmDialog.test.tsx
│   │   ├── __snapshots__
│   │   │   └── ThemedText-test.tsx.snap
│   │   └── camera
│   │       ├── BarcodeScanner.test.tsx
│   │       └── CameraModal.test.tsx
│   ├── contexts
│   │   ├── AuthContext.test.tsx
│   │   └── LastClipBookContext.test.tsx
│   ├── hooks
│   │   ├── useAuth.test.tsx
│   │   └── useBookScanner.test.tsx
│   ├── services
│   │   ├── BookStorageService.test.ts
│   │   ├── ClipStorageService.test.ts
│   │   ├── LocalStorageService.test.ts
│   │   ├── OCRService.test.ts
│   │   ├── RakutenBookService.test.ts
│   │   ├── StorageMigrationService.test.ts
│   │   ├── SupabaseStorageService.test.ts
│   │   └── auth.test.ts
│   ├── setup.js
│   └── test-utils.tsx
├── tsconfig.json
└── types
    └── env.d.ts

49 directories, 153 files
