import { renderHook, act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { useWindowDimensions } from '../useWindowDimensions';

describe('useWindowDimensions', () => {
  let removeCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    removeCallback = jest.fn();
    // Dimensionsのaddおよびremoveイベントリスナーをモック
    (Dimensions.addEventListener as jest.Mock).mockReturnValue({
      remove: removeCallback
    });
  });

  it('初期状態で正しいウィンドウサイズを返す', () => {
    const { result } = renderHook(() => useWindowDimensions());

    expect(result.current).toEqual({
      width: 400, // jest.setup.jsで設定した値
      height: 800,
    });
  });

  it('ウィンドウサイズの変更を検知して更新する', async () => {
    const { result } = renderHook(() => useWindowDimensions());
    
    // イベントリスナーのコールバックを取得
    const callback = (Dimensions.addEventListener as jest.Mock).mock.calls[0][1];
    
    // ウィンドウサイズの変更をシミュレート
    await act(async () => {
      callback({
        window: {
          width: 500,
          height: 900,
        },
      });
      // 状態更新が反映されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      width: 500,
      height: 900,
    });
  });

  it('アンマウント時にイベントリスナーを削除する', () => {
    const { unmount } = renderHook(() => useWindowDimensions());
    
    unmount();
    
    expect(removeCallback).toHaveBeenCalled();
  });
});
