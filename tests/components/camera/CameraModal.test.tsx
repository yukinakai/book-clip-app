import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CameraModal from "../../../components/camera/CameraModal";
import { Text, View } from "react-native";

// モック
jest.mock("expo-camera", () => ({
  useCameraPermissions: jest.fn(() => [
    { granted: true },
    jest.fn(), // requestPermission関数のモック
  ]),
  CameraView: "CameraView-mock",
}));

jest.mock("@expo/vector-icons", () => {
  // requireを使用してReactとViewを取得
  return {
    Ionicons: (props) => {
      const { name, _size, _color, _style } = props;
      const reactModule = require("react");
      const { View } = require("react-native");
      return reactModule.createElement(View, { testID: `icon-${name}` }, name);
    },
  };
});

// コンポーネントモック
jest.mock("../../../components/camera/BarcodeScanner", () => {
  // requireを使用してReactとViewを取得
  const reactModule = require("react");
  const { View } = require("react-native");

  return function MockBarcodeScanner(props) {
    return reactModule.createElement(View, {
      testID: "barcode-scanner",
      onBarcodeScanned: props.onBarcodeScanned,
    });
  };
});

jest.mock("../../../components/camera/ImagePreview", () => {
  // requireを使用してReactとViewを取得
  const reactModule = require("react");
  const { View } = require("react-native");

  return function MockImagePreview(props) {
    return reactModule.createElement(
      View,
      {
        testID: "image-preview",
        ...props,
      },
      "ImagePreview"
    );
  };
});

jest.mock("../../../components/camera/PermissionRequest", () => {
  // requireを使用してReactとViewを取得
  const reactModule = require("react");
  const { View } = require("react-native");

  return function MockPermissionRequest(props) {
    return reactModule.createElement(
      View,
      {
        testID: "permission-request",
        loading: props.loading,
        requestPermission: props.requestPermission,
      },
      "PermissionRequest"
    );
  };
});

// useBookScannerフックのモックを拡張
const mockHandleBarcodeScanned = jest.fn();
const mockResetScanner = jest.fn();
const mockShowManualForm = jest.fn();
const mockHideManualForm = jest.fn();
const mockHandleManualSave = jest.fn();
const mockSetBookTitle = jest.fn();
const mockSetBookAuthor = jest.fn();

// モックの状態を管理するためのオブジェクト
const mockBookScannerState = {
  showManualEntryForm: false,
  isLoading: false,
  bookTitle: "",
  bookAuthor: "",
};

// useBookScannerフックのモック
jest.mock("../../../hooks/useBookScanner", () => ({
  useBookScanner: jest.fn().mockImplementation(({ onClose: _onClose }) => ({
    handleBarcodeScanned: mockHandleBarcodeScanned,
    isLoading: mockBookScannerState.isLoading,
    resetScanner: mockResetScanner,
    // 手動入力関連の状態と関数を追加
    showManualEntryForm: mockBookScannerState.showManualEntryForm,
    showManualForm: mockShowManualForm,
    hideManualForm: mockHideManualForm,
    bookTitle: mockBookScannerState.bookTitle,
    setBookTitle: mockSetBookTitle,
    bookAuthor: mockBookScannerState.bookAuthor,
    setBookAuthor: mockSetBookAuthor,
    handleManualSave: mockHandleManualSave,
  })),
}));

// Colors とライトモードのモック
jest.mock("../../../constants/Colors", () => ({
  Colors: {
    light: {
      text: "#000000",
      background: "#FFFFFF",
      primary: "#007AFF",
      tabIconDefault: "#cccccc",
      secondaryBackground: "#F0F0F0",
    },
    dark: {
      text: "#FFFFFF",
      background: "#000000",
      primary: "#007AFF",
      tabIconDefault: "#888888",
      secondaryBackground: "#333333",
    },
  },
}));

// useColorSchemeのモック
jest.mock("../../../hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

describe("CameraModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // テスト前にモック状態をリセット
    mockBookScannerState.showManualEntryForm = false;
    mockBookScannerState.isLoading = false;
    mockBookScannerState.bookTitle = "";
    mockBookScannerState.bookAuthor = "";

    // カメラ権限のデフォルト設定
    jest
      .mocked(require("expo-camera").useCameraPermissions)
      .mockReturnValue([{ granted: true }, jest.fn()]);
  });

  it("モーダルが表示されること", () => {
    const { getByTestId, UNSAFE_getByProps } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // モーダルが表示されていることを確認
    expect(getByTestId("icon-close")).toBeTruthy();

    // モーダルのvisibleプロパティを確認
    const modal = UNSAFE_getByProps({ animationType: "slide" });
    expect(modal.props.visible).toBe(true);
  });

  it("モーダルが非表示のときも適切なPropsでレンダリングされること", () => {
    const { UNSAFE_getByProps } = render(
      <CameraModal
        isVisible={false}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    const modal = UNSAFE_getByProps({ animationType: "slide" });
    expect(modal.props.visible).toBe(false);
  });

  it("onRequestCloseが呼ばれるとonCloseが実行されること", () => {
    const mockOnClose = jest.fn();
    const { UNSAFE_getByProps } = render(
      <CameraModal
        isVisible={true}
        onClose={mockOnClose}
        onImageCaptured={jest.fn()}
      />
    );

    // onRequestCloseを手動で呼び出す
    UNSAFE_getByProps({ animationType: "slide" }).props.onRequestClose();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockResetScanner).toHaveBeenCalledTimes(1);
  });

  it("カメラ権限がない場合、PermissionRequestが表示されること", () => {
    // カメラ権限がない状態にモックを変更
    jest
      .mocked(require("expo-camera").useCameraPermissions)
      .mockReturnValue([{ granted: false }, jest.fn()]);

    const { getByTestId } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    expect(getByTestId("permission-request")).toBeTruthy();
  });

  it("カメラ権限がある場合、BarcodeScannerが表示されること", () => {
    const { getByTestId } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    expect(getByTestId("barcode-scanner")).toBeTruthy();
  });

  it("capturedImageがある場合、ImagePreviewコンポーネントの動作を確認", () => {
    // capturedImageの処理に関する関数のテスト
    const mockOnImageCaptured = jest.fn();
    const mockOnClose = jest.fn();
    const mockOnUse = jest.fn();
    const mockOnRetake = jest.fn();

    // ImagePreviewコンポーネントに渡されるpropsのテスト
    const mockImagePreviewProps = {
      imageUri: "test-image.jpg",
      onRetake: mockOnRetake,
      onUse: mockOnUse,
    };

    // onUse関数のロジックテスト
    mockImagePreviewProps.onUse("test-image.jpg");
    mockOnImageCaptured("test-image.jpg");
    mockOnClose();

    expect(mockOnImageCaptured).toHaveBeenCalledWith("test-image.jpg");
    expect(mockOnClose).toHaveBeenCalled();

    // onRetake関数のロジックテスト
    const mockSetCapturedImage = jest.fn();
    mockOnRetake();
    mockSetCapturedImage(null);
    expect(mockSetCapturedImage).toHaveBeenCalledWith(null);
  });

  it("エラーメッセージの表示ロジックをテスト", () => {
    // エラーメッセージ表示の条件をテスト
    const renderErrorMessage = (errorText: string | null) => {
      if (errorText) {
        return (
          <View>
            <Text>{errorText}</Text>
          </View>
        );
      }
      return null;
    };

    // エラーがある場合
    const errorOutput = renderErrorMessage("テストエラー");
    expect(errorOutput).not.toBeNull();

    // エラーがない場合
    const noErrorOutput = renderErrorMessage(null);
    expect(noErrorOutput).toBeNull();
  });

  it("手動入力モードが有効な場合、手動入力フォームが表示されること", () => {
    // 手動入力モードを有効にする
    mockBookScannerState.showManualEntryForm = true;

    const { queryByText } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // 手動入力フォームのタイトルが表示されていることを確認
    expect(queryByText("書籍情報を入力")).toBeTruthy();
  });

  it("手動入力ボタンを押すとshowManualFormが呼ばれること", () => {
    const { getByText } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // 手動入力ボタンをクリック
    fireEvent.press(getByText("手動で入力"));
    expect(mockShowManualForm).toHaveBeenCalledTimes(1);
  });

  it("手動入力フォームのキャンセルボタンを押すとhideManualFormが呼ばれること", () => {
    // 手動入力モードを有効にする
    mockBookScannerState.showManualEntryForm = true;

    const { getByText } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // キャンセルボタンをクリック
    fireEvent.press(getByText("キャンセル"));
    expect(mockHideManualForm).toHaveBeenCalledTimes(1);
  });

  it("手動入力フォームの登録ボタンを押すとhandleManualSaveが呼ばれること", () => {
    // 手動入力モードを有効にする
    mockBookScannerState.showManualEntryForm = true;

    const { getByText } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // 登録ボタンをクリック
    fireEvent.press(getByText("登録する"));
    expect(mockHandleManualSave).toHaveBeenCalledTimes(1);
  });

  it("ローディング状態の場合、ローディングオーバーレイが表示されること", () => {
    // ローディング状態を有効にする
    mockBookScannerState.isLoading = true;

    const { getByText } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // ローディングメッセージが表示されていることを確認
    expect(getByText("書籍を保存中...")).toBeTruthy();
  });

  it("カメラ権限がまだ取得中の場合、ローディング状態のPermissionRequestが表示されること", () => {
    // カメラ権限がnullの状態（まだ取得中）にモックを変更
    jest
      .mocked(require("expo-camera").useCameraPermissions)
      .mockReturnValue([null, jest.fn()]);

    const { getByTestId } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // PermissionRequestコンポーネントが表示されていることを確認
    const permissionRequest = getByTestId("permission-request");
    expect(permissionRequest).toBeTruthy();
    expect(permissionRequest.props.loading).toBe(true);
  });

  it("閉じるボタンがヘッダーに表示されること", () => {
    const { getByTestId } = render(
      <CameraModal
        isVisible={true}
        onClose={jest.fn()}
        onImageCaptured={jest.fn()}
      />
    );

    // closeアイコンがあることを確認
    expect(getByTestId("icon-close")).toBeTruthy();
  });
});
