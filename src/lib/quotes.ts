import { supabase } from './supabase';
import { Quote, CreateQuoteInput, UpdateQuoteInput, QuoteSearchOptions } from '@/types/quote';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

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
 * 引用を検索
 */
export const searchQuotes = async (options: QuoteSearchOptions = {}): Promise<Quote[]> => {
  try {
    let query = supabase
      .from('quotes')
      .select(options.tagIds?.length ? `
        *,
        tags!inner (*)
      ` : `
        *,
        tags (*)
      `);

    // キーワード検索
    if (options.query) {
      query = query.ilike('content', `%${options.query}%`);
    }

    // タグによる絞り込み
    if (options.tagIds?.length) {
      query = query.in('tags.id', options.tagIds);
    }

    // ソート順
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    }

    // ページネーション
    if (options.limit !== undefined && options.offset !== undefined) {
      const from = options.offset;
      const to = options.offset + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data;
  } catch (error) {
    console.error('引用の検索に失敗しました:', error);
    return [];
  }
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
