import React, { ReactElement } from 'react';
import { render } from '@testing-library/react-native';

function customRender(ui: ReactElement, options = {}) {
  return render(ui, {
    ...options,
  });
}

export * from '@testing-library/react-native';
export { customRender as render };
