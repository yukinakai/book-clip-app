import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import WithdrawConfirmDialog from "../../components/WithdrawConfirmDialog";

describe("WithdrawConfirmDialog", () => {
  it("表示状態が正しく制御されること", () => {
    // 表示状態がfalseの場合はレンダリングされない
    const { queryByText } = render(
      <WithdrawConfirmDialog
        visible={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        loading={false}
      />
    );

    expect(queryByText("退会の確認")).toBeNull();

    // 表示状態がtrueの場合はレンダリングされる
    const { getByText } = render(
      <WithdrawConfirmDialog
        visible={true}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        loading={false}
      />
    );

    expect(getByText("退会の確認")).toBeTruthy();
    expect(
      getByText(/退会すると、アカウントに関連するすべてのデータが削除され/)
    ).toBeTruthy();
  });

  it("「キャンセル」ボタンをタップするとonCloseが呼ばれること", () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <WithdrawConfirmDialog
        visible={true}
        onClose={onCloseMock}
        onConfirm={jest.fn()}
        loading={false}
      />
    );

    fireEvent.press(getByText("キャンセル"));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("「退会する」ボタンをタップするとonConfirmが呼ばれること", () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(
      <WithdrawConfirmDialog
        visible={true}
        onClose={jest.fn()}
        onConfirm={onConfirmMock}
        loading={false}
      />
    );

    fireEvent.press(getByText("退会する"));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it("ローディング中はボタンが無効化されていること", () => {
    const onCloseMock = jest.fn();
    const onConfirmMock = jest.fn();
    const { getByTestId } = render(
      <WithdrawConfirmDialog
        visible={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        loading={true}
      />
    );

    // ローディング中はボタンが無効化されているか確認
    fireEvent.press(getByTestId("withdraw-cancel-button"));
    fireEvent.press(getByTestId("withdraw-confirm-button"));

    expect(onCloseMock).not.toHaveBeenCalled();
    expect(onConfirmMock).not.toHaveBeenCalled();
  });
});
