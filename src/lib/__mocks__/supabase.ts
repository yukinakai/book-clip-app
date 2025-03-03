const defaultResponse = {
  data: null,
  error: null
};

// メソッドチェーン用の共通ヘルパー
const createChainableMethod = (returnValue = defaultResponse) => {
  const fn = jest.fn();
  fn.mockReturnValue({
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(returnValue),
    ...returnValue // レスポンスをマージして柔軟な上書きを可能に
  });
  return fn;
};

export const supabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null
    }),
    onAuthStateChange: jest.fn((callback) => {
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      };
    })
  },
  from: jest.fn().mockReturnValue({
    insert: createChainableMethod(),
    select: createChainableMethod(),
    update: createChainableMethod(),
    delete: createChainableMethod(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(defaultResponse)
  })
};
