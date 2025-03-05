import { supabase } from './supabase';
import { Tag } from '@/types/tag';

/**
 * タグを作成する
 * @param name タグ名
 * @returns 作成されたタグ情報
 */
export const createTag = async (name: string): Promise<Tag | null> => {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('タグの作成に失敗しました:', error);
    return null;
  }

  return data;
};

/**
 * タグを更新する
 * @param id タグID
 * @param name 新しいタグ名
 * @returns 更新されたタグ情報
 */
export const updateTag = async (
  id: string,
  name: string
): Promise<Tag | null> => {
  const { data, error } = await supabase
    .from('tags')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('タグの更新に失敗しました:', error);
    return null;
  }

  return data;
};

/**
 * タグを削除する
 * @param id タグID
 * @returns 削除に成功した場合はtrue
 */
export const deleteTag = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('タグの削除に失敗しました:', error);
    return false;
  }

  return true;
};

/**
 * 全てのタグを取得する
 * @returns タグのリスト
 */
export const getAllTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('タグの取得に失敗しました:', error);
    return [];
  }

  return data || [];
};

/**
 * 指定された引用のタグを取得する
 * @param quoteId 引用ID
 * @returns タグのリスト
 */
export const getTagsByQuoteId = async (quoteId: string): Promise<Tag[]> => {
  type TagResponse = {
    tags: {
      id: string;
      name: string;
      created_at: string;
      updated_at: string;
      user_id: string;
    };
  };

  const { data, error } = await supabase
    .from('quote_tags')
    .select(`
      tags (
        id,
        name,
        created_at,
        updated_at,
        user_id
      )
    `)
    .eq('quote_id', quoteId)
    .returns<TagResponse[]>();

  if (error) {
    console.error('引用のタグ取得に失敗しました:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.tags.id,
    name: item.tags.name,
    createdAt: item.tags.created_at,
    updatedAt: item.tags.updated_at,
    userId: item.tags.user_id
  }));
};

/**
 * 引用にタグを追加する
 * @param quoteId 引用ID
 * @param tagId タグID
 * @returns 追加に成功した場合はtrue
 */
export const addTagToQuote = async (
  quoteId: string,
  tagId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('quote_tags')
    .insert([{ quote_id: quoteId, tag_id: tagId }]);

  if (error) {
    console.error('引用へのタグ追加に失敗しました:', error);
    return false;
  }

  return true;
};

/**
 * 引用からタグを削除する
 * @param quoteId 引用ID
 * @param tagId タグID
 * @returns 削除に成功した場合はtrue
 */
export const removeTagFromQuote = async (
  quoteId: string,
  tagId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('quote_tags')
    .delete()
    .eq('quote_id', quoteId)
    .eq('tag_id', tagId);

  if (error) {
    console.error('引用からのタグ削除に失敗しました:', error);
    return false;
  }

  return true;
};
