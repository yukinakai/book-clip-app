import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedText } from "../ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";

jest.mock("@/hooks/useColorScheme");
const mockUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

describe("ThemedText", () => {
  it("renders text with light theme colors", () => {
    mockUseColorScheme.mockReturnValue("light");
    const { getByTestId } = render(<ThemedText testID="themed-text">Test Text</ThemedText>);
    const textElement = getByTestId("themed-text");
    expect(textElement.props.style[0]).toEqual({ color: "#000" });
  });

  it("renders text with dark theme colors", () => {
    mockUseColorScheme.mockReturnValue("dark");
    const { getByTestId } = render(<ThemedText testID="themed-text">Test Text</ThemedText>);
    const textElement = getByTestId("themed-text");
    expect(textElement.props.style[0]).toEqual({ color: "#fff" });
  });

  it("applies custom styles", () => {
    mockUseColorScheme.mockReturnValue("light");
    const { getByTestId } = render(
      <ThemedText testID="themed-text" style={{ fontSize: 20 }}>Test Text</ThemedText>
    );
    const textElement = getByTestId("themed-text");
    expect(textElement.props.style[1]).toEqual({ fontSize: 20 });
  });
});
