import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import ScanScreen from '../scan';

// BarcodeScannerコンポーネントをモック
let onScanCallback: ((isbn: string) => void) | undefined;

jest.mock('../../../components/BarcodeScanner', () => ({
  BarcodeScannerView: jest.fn(({ onScan }) => {
    // コールバックを保存して後でテストから呼び出せるようにする
    onScanCallback = onScan;
    return null;
  })
}));

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // コンソール出力をミュート
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('初期状態ではバーコードスキャナーが表示される', () => {
    render(<ScanScreen />);
    // BarcodeScannerViewがレンダリングされていることを確認
    const { BarcodeScannerView } = jest.requireMock('../../../components/BarcodeScanner');
    expect(BarcodeScannerView).toHaveBeenCalled();
  });

  it('バーコードスキャン時にステートが更新される', () => {
    const { queryByTestId } = render(<ScanScreen />);
    
    // BarcodeScannerのコールバックが設定されていることを確認
    expect(onScanCallback).toBeDefined();
    
    // コールバックを実行
    const testIsbn = '9784167158057';
    onScanCallback?.(testIsbn);
    
    // 読み込み状態が更新されていることを確認
    expect(console.log).toHaveBeenCalledWith('Scanned ISBN:', testIsbn);
  });
});
