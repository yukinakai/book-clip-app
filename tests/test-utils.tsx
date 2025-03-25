import { ReactElement } from "react";
import { render } from "@testing-library/react-native";
import { LastClipBookProvider } from "../contexts/LastClipBookContext";

function customRender(ui: ReactElement, options = {}) {
  return render(<LastClipBookProvider>{ui}</LastClipBookProvider>, {
    ...options,
  });
}

export * from "@testing-library/react-native";
export { customRender as render };
