/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// メインカラー（Primary Colors）
const bookNavy = "#2B3A67"; // レトロな本の装丁を想起させる、深く落ち着いた紺

// アクセントカラー（Accent Colors）
const antiqueGold = "#D1A85F"; // 深いネイビーと調和し、レトロ感と品格を醸成するゴールド調のイエロー
const insightGreen = "#558B6E"; // 落ち着いた雰囲気の中にも、学びや気づきを与える穏やかなグリーン

// ベースカラー（Neutral Colors）
const paperWhite = "#FAFAF5"; // 書籍ページのような柔らかな白
const vintageBeige = "#E8E0D1"; // 紙やヴィンテージ書籍の質感を演出する落ち着いたベージュ
const inkBlack = "#323031"; // 紙に印刷されたインクを連想させる、穏やかで濃すぎないブラック

// サブカラー（Supporting Colors）
const libraryGray = "#7C7C84"; // サブ情報やタグなどの補助的な役割を果たし、落ち着きと視認性を両立
const classicRed = "#A63A50"; // 削除や注意喚起を示すための控えめな深い赤

// ダークモードの派生カラー
const darkBackground = "#1A1E2A"; // ダークモードの背景色
const darkSecondaryBackground = "#242836"; // ダークモードのセカンダリ背景色
const darkTextColor = "#ECEDEE"; // ダークモードのテキスト色
const darkPaperColor = "#2A2F3F"; // ダークモードの紙色

export const Colors = {
  light: {
    text: inkBlack,
    secondaryText: libraryGray,
    background: paperWhite,
    secondaryBackground: vintageBeige,
    tint: bookNavy,
    icon: libraryGray,
    tabIconDefault: libraryGray,
    tabIconSelected: bookNavy,
    primary: bookNavy,
    accent1: antiqueGold,
    accent2: insightGreen,
    paper: vintageBeige,
    alert: classicRed,
    error: classicRed,
    success: insightGreen,
  },
  dark: {
    text: darkTextColor,
    secondaryText: "#9999A8",
    background: darkBackground,
    secondaryBackground: darkSecondaryBackground,
    tint: bookNavy,
    icon: libraryGray,
    tabIconDefault: libraryGray,
    tabIconSelected: bookNavy,
    primary: bookNavy,
    accent1: antiqueGold,
    accent2: insightGreen,
    paper: darkPaperColor,
    alert: classicRed,
    error: classicRed,
    success: insightGreen,
  },
};
