import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DataMigrationConfirmDialog from "../../components/DataMigrationConfirmDialog";
import { ActivityIndicator, Text } from "react-native";

// ThemedTextコンポーネントをモック
jest.mock("../../components/ThemedText", () => ({
  ThemedText: (props: { children: React.ReactNode; style?: any }) => {
    const { children } = props;
    // Textコンポーネントを使ってテキスト内容を表示できるようにする
    return <Text>{children}</Text>;
  },
}));

describe("DataMigrationConfirmDialog", () => {
  // テスト用のデフォルトprops
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    loading: false,
    hasLocalData: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ローカルデータがない場合は何も表示されないこと", () => {
    const { queryByTestId } = render(
      <DataMigrationConfirmDialog {...defaultProps} hasLocalData={false} />
    );

    // ダイアログ要素が存在しないことを確認
    expect(queryByTestId("data-migration-confirm-dialog")).toBeNull();
  });

  it("ローカルデータがあり、visibleがtrueの場合はダイアログが表示されること", () => {
    const { getByTestId, getAllByText } = render(
      <DataMigrationConfirmDialog {...defaultProps} />
    );

    // ダイアログが表示されていることを確認
    expect(getByTestId("data-migration-confirm-dialog")).toBeTruthy();

    // タイトルとメッセージが表示されていることを確認
    // 正規表現で部分一致で検索
    expect(getAllByText(/データ移行の確認/)[0]).toBeTruthy();
    expect(
      getAllByText(/端末に保存されているデータをクラウドに移行しますか？/)[0]
    ).toBeTruthy();

    // ボタンが表示されていることを確認
    expect(getAllByText(/キャンセル/)[0]).toBeTruthy();
    expect(getAllByText(/移行する/)[0]).toBeTruthy();
  });

  it("キャンセルボタンをタップするとonCloseが呼ばれること", () => {
    const { getByTestId } = render(
      <DataMigrationConfirmDialog {...defaultProps} />
    );

    // キャンセルボタンをタップ
    fireEvent.press(getByTestId("data-migration-cancel-button"));

    // onCloseが呼ばれたことを確認
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("確認ボタンをタップするとonConfirmが呼ばれること", () => {
    const { getByTestId } = render(
      <DataMigrationConfirmDialog {...defaultProps} />
    );

    // 確認ボタンをタップ
    fireEvent.press(getByTestId("data-migration-confirm-button"));

    // onConfirmが呼ばれたことを確認
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("ローディング中はボタンが無効化され、ActivityIndicatorが表示されること", () => {
    const { getByTestId, queryAllByText, UNSAFE_getByType } = render(
      <DataMigrationConfirmDialog {...defaultProps} loading={true} />
    );

    // 確認ボタンにActivityIndicatorが表示されていることを確認
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    // "移行する"テキストが表示されていないことを確認
    expect(queryAllByText(/移行する/).length).toBe(0);

    // 両方のボタンが無効化されていることを確認
    const cancelButton = getByTestId("data-migration-cancel-button");
    const confirmButton = getByTestId("data-migration-confirm-button");

    expect(cancelButton.props.accessibilityState.disabled).toBe(true);
    expect(confirmButton.props.accessibilityState.disabled).toBe(true);

    // ボタンをタップしてもイベントハンドラが呼ばれないことを確認
    fireEvent.press(cancelButton);
    fireEvent.press(confirmButton);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });
});
