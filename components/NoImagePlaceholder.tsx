import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

interface NoImagePlaceholderProps {
  width?: number;
  height?: number;
}

/**
 * 書籍のサムネイルが存在しない場合に表示するプレースホルダーコンポーネント
 */
const NoImagePlaceholder: React.FC<NoImagePlaceholderProps> = ({
  width = 150,
  height = 200,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* 背景 - より薄い灰色 */}
        <Rect width={width} height={height} fill="#9e9e9e" rx={8} />

        {/* テキスト - 白色、サイズ拡大 */}
        <SvgText
          x={width / 2}
          y={height / 2}
          fontFamily="Arial"
          fontSize={width * 0.15}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#ffffff"
          fontWeight="bold"
        >
          No Image
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 8,
  },
});

export default NoImagePlaceholder;
