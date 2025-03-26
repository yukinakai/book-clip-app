/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// メインカラー（Primary Colors）
const bookNavy = "#2B3A67"; // レトロな本の装丁を想起させる、深く落ち着いた紺
const deepBookNavy = "#202B47"; // ダークモード用：明度を抑え、落ち着いた深い紺色。重厚感を維持しつつ目への負担を軽減

// アクセントカラー（Accent Colors）
const antiqueGold = "#D1A85F"; // 深いネイビーと調和し、レトロ感と品格を醸成するゴールド調のイエロー
const softAntiqueGold = "#B89658"; // ダークモード用：ゴールドの明るさを抑え、ダークモードに馴染む柔らかい黄金色
const insightGreen = "#558B6E"; // 落ち着いた雰囲気の中にも、学びや気づきを与える穏やかなグリーン
const darkInsightGreen = "#416956"; // ダークモード用：深みを増した緑で、情報の保存・成功通知に最適

// ベースカラー（Neutral Colors）
const paperWhite = "#FAFAF5"; // 書籍ページのような柔らかな白
const vintageBeige = "#E8E0D1"; // 紙やヴィンテージ書籍の質感を演出する落ち着いたベージュ
const inkBlack = "#323031"; // 紙に印刷されたインクを連想させる、穏やかで濃すぎないブラック
const darkPaper = "#1A1D29"; // ダークモード用：背景色として深いグレー系のネイビー
const midnightGray = "#282C3F"; // ダークモード用：コンテンツエリアやカード型UI要素用
const softWhite = "#E0E2E7"; // ダークモード用：目立ちすぎず視認性を損なわない本文用カラー

// サブカラー（Supporting Colors）
const libraryGray = "#7C7C84"; // サブ情報やタグなどの補助的な役割を果たし、落ち着きと視認性を両立
const slateGray = "#5D6173"; // ダークモード用：タグや補助テキストなど控えめに表示したい情報向け
const classicRed = "#A63A50"; // 削除や注意喚起を示すための控えめな深い赤
const darkClassicRed = "#833341"; // ダークモード用：削除操作や警告表示に使う深みのある赤

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
    divider: "#DDDDDD",
  },
  dark: {
    text: softWhite,
    secondaryText: slateGray,
    background: darkPaper,
    secondaryBackground: midnightGray,
    tint: softWhite,
    icon: slateGray,
    tabIconDefault: slateGray,
    tabIconSelected: softWhite,
    primary: deepBookNavy,
    accent1: softAntiqueGold,
    accent2: darkInsightGreen,
    paper: midnightGray,
    alert: darkClassicRed,
    error: darkClassicRed,
    success: darkInsightGreen,
    divider: "#444444",
  },
};
