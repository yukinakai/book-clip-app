export const supabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => ({
          data: data[0],
          error: null
        })
      })
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        select: () => ({
          single: async () => ({
            data,
            error: null
          })
        })
      })
    }),
    delete: () => ({
      eq: (field: string, value: any) => ({
        eq: (field: string, value: any) => ({
          single: async () => ({
            error: null
          })
        })
      })
    }),
    select: (query?: string) => ({
      eq: (field: string, value: any) => ({
        single: async () => ({
          data: { id: '1', name: 'Test Tag' },
          error: null
        })
      }),
      order: (field: string) => ({
        then: async () => ({
          data: [{ id: '1', name: 'Test Tag' }],
          error: null
        })
      })
    })
  })
};
