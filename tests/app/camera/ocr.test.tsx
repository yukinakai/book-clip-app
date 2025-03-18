import { render, fireEvent } from "../../test-utils";
import OCRCameraScreen from "../../../app/camera/ocr";

// モックの設定
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => mockRouter),
}));

// CameraViewコンポーネントをモック
jest.mock("../../../components/CameraView", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");

  return {
    __esModule: true,
    default: jest.fn(({ onCapture, onClose }) => {
      return (
        <View testID="camera-view">
          <TouchableOpacity
            testID="capture-button"
            onPress={() => onCapture("test-image-uri")}
          >
            <Text>撮影</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="close-button" onPress={onClose}>
            <Text>閉じる</Text>
          </TouchableOpacity>
        </View>
      );
    }),
  };
});

// コンソールログのモック
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

describe("OCRCameraScreen", () => {
  beforeEach(() => {
    // テスト前に各モックをリセット
    jest.clearAllMocks();
  });

  it("CameraViewコンポーネントが表示されること", () => {
    const { getByTestId } = render(<OCRCameraScreen />);

    // CameraViewが表示されていることを確認
    expect(getByTestId("camera-view")).toBeTruthy();
  });

  it("画像キャプチャ時に正しいURLに遷移すること", () => {
    const { getByTestId } = render(<OCRCameraScreen />);

    // 画像をキャプチャ
    fireEvent.press(getByTestId("capture-button"));

    // コンソールログが呼ばれることを確認
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "OCR用画像が選択されました:",
      "test-image-uri"
    );

    // 正しいURLに遷移することを確認
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/book/add-clip?imageUri=test-image-uri&isOcr=true"
    );
  });

  it("閉じるボタンを押すと前の画面に戻ること", () => {
    const { getByTestId } = render(<OCRCameraScreen />);

    // 閉じるボタンを押す
    fireEvent.press(getByTestId("close-button"));

    // 前の画面に戻ることを確認
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
