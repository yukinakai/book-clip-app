import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DataMigrationConfirmDialog from "../../components/DataMigrationConfirmDialog";
import { ActivityIndicator } from "react-native";

// ThemedTextコンポーネントをモック
jest.mock("../../components/ThemedText", () => ({
  ThemedText: (props: { children: React.ReactNode; style?: any }) => {
    const { children } = props;
    // Reactを直接参照せず、jsxでフラグメントを使用
    return <>{children}</>;
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
    const { getByTestId, getByText } = render(
      <DataMigrationConfirmDialog {...defaultProps} />
    );

    // ダイアログが表示されていることを確認
    expect(getByTestId("data-migration-confirm-dialog")).toBeTruthy();

    // タイトルとメッセージが表示されていることを確認
    expect(getByText("データ移行の確認")).toBeTruthy();
    expect(
      getByText(/端末に保存されているデータをクラウドに移行しますか？/)
    ).toBeTruthy();

    // ボタンが表示されていることを確認
    expect(getByText("キャンセル")).toBeTruthy();
    expect(getByText("移行する")).toBeTruthy();
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
    const { getByTestId, queryByText, UNSAFE_getByType } = render(
      <DataMigrationConfirmDialog {...defaultProps} loading={true} />
    );

    // 確認ボタンにActivityIndicatorが表示されていることを確認
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    // "移行する"テキストが表示されていないことを確認
    expect(queryByText("移行する")).toBeNull();

    // 両方のボタンが無効化されていることを確認
    const cancelButton = getByTestId("data-migration-cancel-button");
    const confirmButton = getByTestId("data-migration-confirm-button");

    expect(cancelButton.props.disabled).toBe(true);
    expect(confirmButton.props.disabled).toBe(true);

    // ボタンをタップしてもイベントハンドラが呼ばれないことを確認
    fireEvent.press(cancelButton);
    fireEvent.press(confirmButton);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });
});
