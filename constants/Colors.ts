/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// メインカラー（Primary Colors）
const bookClipBlue = "#2B3A67"; // 信頼感や集中力を与える知的で明るいブルー

// アクセントカラー（Accent Colors）
const clipYellow = "#FFD644"; // 強調や注目させたい情報をハイライトするための活力あるイエロー
const insightGreen = "#3ECF8E"; // 読書から得られる新たな気づきや理解の深まりを表現する新鮮なグリーン

// ベースカラー（Neutral Colors）
const baseWhite = "#FFFFFF"; // 読書に最適な清潔感と視認性のある白
const paperBeige = "#F8F4ED"; // 本や紙の質感を連想させるナチュラルなベージュ
const textBlack = "#333333"; // 長時間読んでも疲れにくい、濃すぎない柔らかなブラック

// サブカラー（Supporting Colors）
const archiveGrey = "#8D99AE"; // データ管理やサブ情報、タグなど補助的な要素に使用する落ち着いたグレー
const alertRed = "#FF5C5C"; // 削除、エラー、注意喚起を促す際の強調色

// ダークモードの派生カラー
const darkBackground = "#1A1E2A"; // ダークモードの背景色
const darkSecondaryBackground = "#242836"; // ダークモードのセカンダリ背景色
const darkTextColor = "#ECEDEE"; // ダークモードのテキスト色
const darkPaperColor = "#2A2F3F"; // ダークモードの紙色

export const Colors = {
  light: {
    text: textBlack,
    background: baseWhite,
    secondaryBackground: paperBeige,
    tint: bookClipBlue,
    icon: archiveGrey,
    tabIconDefault: archiveGrey,
    tabIconSelected: bookClipBlue,
    primary: bookClipBlue,
    accent1: clipYellow,
    accent2: insightGreen,
    paper: paperBeige,
    alert: alertRed,
    success: insightGreen,
  },
  dark: {
    text: darkTextColor,
    background: darkBackground,
    secondaryBackground: darkSecondaryBackground,
    tint: bookClipBlue,
    icon: archiveGrey,
    tabIconDefault: archiveGrey,
    tabIconSelected: bookClipBlue,
    primary: bookClipBlue,
    accent1: clipYellow,
    accent2: insightGreen,
    paper: darkPaperColor,
    alert: alertRed,
    success: insightGreen,
  },
};
