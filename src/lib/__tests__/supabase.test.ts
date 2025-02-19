import { supabase } from '../supabase';

describe('Supabase Client', () => {
  it('should be defined', () => {
    expect(supabase).toBeDefined();
  });

  it('should have required methods', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should be able to connect to Supabase', async () => {
    const { data, error } = await supabase.auth.getSession();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
