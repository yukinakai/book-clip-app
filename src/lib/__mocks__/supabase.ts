// Mock implementation of supabase client
export const supabase = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ 
          data: { id: '1', name: 'Test Tag' }, 
          error: null 
        })
      }),
      order: jest.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Test Tag' }],
        error: null
      })
    }),
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: '1', name: 'New Tag' },
          error: null
        })
      })
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '1', name: 'Updated Tag' },
            error: null
          })
        })
      })
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      })
    })
  })
};
