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
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);
    const text = getByText("Test Text");
    expect(text.props.style[0]).toEqual({ color: "#000" });
  });

  it("renders text with dark theme colors", () => {
    mockUseColorScheme.mockReturnValue("dark");
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);
    const text = getByText("Test Text");
    expect(text.props.style[0]).toEqual({ color: "#fff" });
  });

  it("applies custom styles", () => {
    mockUseColorScheme.mockReturnValue("light");
    const { getByText } = render(
      <ThemedText style={{ fontSize: 20 }}>Test Text</ThemedText>
    );
    const text = getByText("Test Text");
    expect(text.props.style[1]).toEqual({ fontSize: 20 });
  });
});
