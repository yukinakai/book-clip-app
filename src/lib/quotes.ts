import { supabase } from './supabase';
import { Quote, CreateQuoteInput, UpdateQuoteInput } from '@/types/quote';

/**
 * 引用を作成
 */
export const createQuote = async (input: CreateQuoteInput): Promise<Quote> => {
  const { data, error } = await supabase
    .from('quotes')
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('引用の作成に失敗しました');

  return data;
};

/**
 * 引用を取得
 */
export const getQuote = async (id: string): Promise<Quote> => {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      tags (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('引用が見つかりませんでした');

  return data;
};

/**
 * 書籍に紐づく引用一覧を取得
 */
export const getQuotesByBookId = async (bookId: string): Promise<Quote[]> => {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      tags (*)
    `)
    .eq('bookId', bookId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data;
};

/**
 * 引用を更新
 */
export const updateQuote = async (
  id: string,
  input: UpdateQuoteInput
): Promise<Quote> => {
  const { data, error } = await supabase
    .from('quotes')
    .update(input)
    .eq('id', id)
    .select(`
      *,
      tags (*)
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('引用の更新に失敗しました');

  return data;
};

/**
 * 引用を削除
 */
export const deleteQuote = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
};

/**
 * 引用のタグを更新
 */
export const updateQuoteTags = async (
  quoteId: string,
  tagIds: string[]
): Promise<void> => {
  // 現在のタグを削除
  const { error: deleteError } = await supabase
    .from('quote_tags')
    .delete()
    .eq('quote_id', quoteId);

  if (deleteError) throw deleteError;

  // 新しいタグを追加
  if (tagIds.length > 0) {
    const { error: insertError } = await supabase
      .from('quote_tags')
      .insert(tagIds.map(tagId => ({ quote_id: quoteId, tag_id: tagId })));

    if (insertError) throw insertError;
  }
};
