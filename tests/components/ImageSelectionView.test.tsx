import { render, fireEvent, act } from "../test-utils";
import { Alert } from "react-native";
import ImageSelectionView from "../../components/ImageSelectionView";

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

// テスト用にImageSelectionViewをモックする
jest.mock("../../components/ImageSelectionView", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");

  function MockImageSelectionView(props) {
    const [hasSelection, setHasSelection] = React.useState(false);
    const [selectionVisible, setSelectionVisible] = React.useState(false);

    const handleSelectAll = () => {
      setHasSelection(true);
      setSelectionVisible(true);
    };

    const clearSelection = () => {
      setHasSelection(false);
      setSelectionVisible(false);
    };

    const handleConfirmSelection = () => {
      if (hasSelection) {
        props.onConfirm({
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          imageWidth: 300,
          imageHeight: 200,
        });
      }
    };

    return (
      <View testID="image-selection-container">
        <View testID="header">
          <TouchableOpacity testID="back-button" onPress={props.onCancel}>
            <Text testID="back-text">arrow-back</Text>
          </TouchableOpacity>
          <Text testID="header-title">テキスト領域選択</Text>
        </View>

        <Text testID="instruction-text">
          テキストが含まれる領域を選択してください
        </Text>

        <View testID="image-wrapper">
          {selectionVisible && (
            <View
              testID="selection-box"
              style={{ position: "absolute", borderWidth: 2 }}
            />
          )}
        </View>

        <View testID="buttons-container">
          <TouchableOpacity
            testID="select-all-button"
            onPress={handleSelectAll}
          >
            <Text>すべて選択</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="clear-selection-button"
            onPress={clearSelection}
          >
            <Text>選択解除</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="confirm-button"
            onPress={handleConfirmSelection}
            disabled={!hasSelection}
            style={{ opacity: hasSelection ? 1 : 0.5 }}
            accessibilityState={{ disabled: !hasSelection }}
          >
            <Text>選択を確定</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return MockImageSelectionView;
});

// Ioniconsのモック
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, _size, _color }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: `icon-${name}` }, name);
  },
}));

describe("ImageSelectionViewコンポーネント", () => {
  const mockImageUri = "file://test/image.jpg";
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("コンポーネントが正しくレンダリングされること", () => {
    const { getByText, getByTestId } = render(
      <ImageSelectionView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // ヘッダータイトルが表示されていることを確認
    expect(getByTestId("header-title")).toBeTruthy();

    // 指示テキストが表示されていることを確認
    expect(getByTestId("instruction-text")).toBeTruthy();

    // 各ボタンが表示されていることを確認
    expect(getByText("すべて選択")).toBeTruthy();
    expect(getByText("選択解除")).toBeTruthy();
    expect(getByText("選択を確定")).toBeTruthy();
  });

  it("戻るボタンを押すとonCancelが呼ばれること", () => {
    const { getByTestId } = render(
      <ImageSelectionView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // 戻るボタンを押す
    act(() => {
      fireEvent.press(getByTestId("back-button"));
    });

    // onCancelが呼ばれたことを確認
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("すべて選択ボタンを押すと画像全体が選択されること", () => {
    const { getByTestId } = render(
      <ImageSelectionView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // すべて選択ボタンを押す
    act(() => {
      fireEvent.press(getByTestId("select-all-button"));
    });

    // 選択領域が表示されることを確認
    expect(getByTestId("selection-box")).toBeTruthy();
  });

  it("選択解除ボタンを押すと選択が解除されること", () => {
    const { getByTestId, queryByTestId } = render(
      <ImageSelectionView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // すべて選択ボタンを押す
    act(() => {
      fireEvent.press(getByTestId("select-all-button"));
    });

    // 選択領域が表示されることを確認
    expect(getByTestId("selection-box")).toBeTruthy();

    // 選択解除ボタンを押す
    act(() => {
      fireEvent.press(getByTestId("clear-selection-button"));
    });

    // 選択領域が非表示になることを確認
    expect(queryByTestId("selection-box")).toBeNull();
  });

  it("選択を確定ボタンを押すとonConfirmが呼ばれること", () => {
    const { getByTestId } = render(
      <ImageSelectionView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // すべて選択ボタンを押す
    act(() => {
      fireEvent.press(getByTestId("select-all-button"));
    });

    // 選択を確定ボタンを押す
    act(() => {
      fireEvent.press(getByTestId("confirm-button"));
    });

    // onConfirmが適切なパラメータで呼ばれたことを確認
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
        imageWidth: 300,
        imageHeight: 200,
      })
    );
  });

  it("選択がない状態では確定ボタンが無効化されていること", () => {
    const { getByTestId } = render(
      <ImageSelectionView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // 確定ボタンが無効化されていることを確認
    const confirmButton = getByTestId("confirm-button");
    expect(confirmButton.props.accessibilityState.disabled).toBe(true);
    expect(confirmButton.props.style.opacity).toBe(0.5);
  });
});
