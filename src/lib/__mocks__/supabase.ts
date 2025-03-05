// Mock SupabaseClient
const mockSingle = jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Test Item' }, error: null }));
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockEq = jest.fn(() => ({ select: mockSelect, eq: jest.fn(() => Promise.resolve({ error: null })) }));
const mockOrder = jest.fn(() => Promise.resolve({ data: [{ id: '1', name: 'Test Item' }], error: null }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));

// Main mock
export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({ 
      eq: jest.fn(() => ({ 
        single: mockSingle 
      })),
      order: mockOrder
    })),
    insert: mockInsert,
    update: jest.fn(() => ({ 
      eq: mockEq 
    })),
    delete: jest.fn(() => ({ 
      eq: mockEq 
    }))
  }))
};
