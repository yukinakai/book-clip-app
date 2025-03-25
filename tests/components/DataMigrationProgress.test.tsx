import React from "react";
import { render, screen } from "@testing-library/react-native";
import { DataMigrationProgress } from "../../components/DataMigrationProgress";
import { MigrationProgress } from "../../services/StorageMigrationService";

// useColorSchemeをモック
jest.mock("../../hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

// Colorsをモック
jest.mock("../../constants/Colors", () => ({
  Colors: {
    light: {
      text: "#000000",
      background: "#FFFFFF",
      primary: "#007AFF",
    },
    dark: {
      text: "#FFFFFF",
      background: "#000000",
      primary: "#007AFF",
    },
  },
}));

describe("DataMigrationProgress", () => {
  it("非表示の場合、表示されないこと", () => {
    const progress: MigrationProgress = {
      total: 10,
      current: 5,
      status: "migrating",
    };

    const { toJSON } = render(
      <DataMigrationProgress visible={false} progress={progress} />
    );

    // Modalがvisible=falseの場合、何も表示されない
    expect(toJSON()).toBeNull();
  });

  it("移行中の状態で正しく表示されること", () => {
    const progress: MigrationProgress = {
      total: 10,
      current: 5,
      status: "migrating",
    };

    render(<DataMigrationProgress visible={true} progress={progress} />);

    // モーダルが表示される
    expect(screen.getByTestId("migration-modal")).toBeTruthy();

    // タイトルが表示される
    expect(screen.getByText("データ移行")).toBeTruthy();

    // 状態メッセージが表示される
    expect(screen.getByText("データを移行中です...")).toBeTruthy();

    // 進捗カウントが表示される
    expect(screen.getByText("5 / 10 (50%)")).toBeTruthy();

    // スピナーが表示される
    expect(screen.getByTestId("migration-spinner")).toBeTruthy();

    // プログレスバーが表示される
    expect(screen.getByTestId("migration-progress-bar")).toBeTruthy();
  });

  it("完了状態で正しく表示されること", () => {
    const progress: MigrationProgress = {
      total: 10,
      current: 10,
      status: "completed",
    };

    render(<DataMigrationProgress visible={true} progress={progress} />);

    // 完了メッセージが表示される
    expect(screen.getByText("データの移行が完了しました！")).toBeTruthy();

    // 進捗カウントが表示される
    expect(screen.getByText("10 / 10 (100%)")).toBeTruthy();

    // スピナーが表示されないこと
    expect(screen.queryByTestId("migration-spinner")).toBeNull();

    // プログレスバーが表示される（幅100%）
    const progressBar = screen.getByTestId("migration-progress-bar");
    expect(progressBar).toBeTruthy();
    expect(progressBar.props.style).toContainEqual({ width: "100%" });
  });

  it("エラー状態で正しく表示されること", () => {
    const error = new Error("テストエラー");
    const progress: MigrationProgress = {
      total: 10,
      current: 3,
      status: "failed",
      error: error,
    };

    render(<DataMigrationProgress visible={true} progress={progress} />);

    // エラーメッセージが表示される
    expect(screen.getByText("エラーが発生しました: テストエラー")).toBeTruthy();

    // 進捗カウントが表示される
    expect(screen.getByText("3 / 10 (30%)")).toBeTruthy();

    // スピナーが表示されないこと
    expect(screen.queryByTestId("migration-spinner")).toBeNull();

    // プログレスバーが表示される（幅30%）
    const progressBar = screen.getByTestId("migration-progress-bar");
    expect(progressBar).toBeTruthy();
    expect(progressBar.props.style).toContainEqual({ width: "30%" });
  });

  it("total=0の場合、パーセンテージが0と表示されること", () => {
    const progress: MigrationProgress = {
      total: 0,
      current: 0,
      status: "migrating",
    };

    render(<DataMigrationProgress visible={true} progress={progress} />);

    // 進捗カウントが表示される
    expect(screen.getByText("0 / 0 (0%)")).toBeTruthy();

    // プログレスバーが表示される（幅0%）
    const progressBar = screen.getByTestId("migration-progress-bar");
    expect(progressBar).toBeTruthy();
    expect(progressBar.props.style).toContainEqual({ width: "0%" });
  });

  it("エラーオブジェクトがない場合、不明なエラーと表示されること", () => {
    const progress: MigrationProgress = {
      total: 10,
      current: 3,
      status: "failed",
      // errorプロパティなし
    };

    render(<DataMigrationProgress visible={true} progress={progress} />);

    // デフォルトエラーメッセージが表示される
    expect(screen.getByText("エラーが発生しました: 不明なエラー")).toBeTruthy();
  });
});
