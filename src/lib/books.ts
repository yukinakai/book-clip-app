import { supabase } from '@lib/supabase';
import { Book, CreateBookInput, UpdateBookInput } from '@/types/book';

/**
 * 新しい書籍を作成する
 * @param input 作成する書籍の情報
 * @returns 作成された書籍情報、またはエラー時にnull
 */
export async function createBook(input: CreateBookInput): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .insert([input])
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create book: ', error);
    return null;
  }

  return data;
}

/**
 * 指定されたIDの書籍を取得する
 * @param id 書籍ID
 * @returns 書籍情報、または存在しない場合はnull
 */
export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select()
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error) {
      console.error('Failed to get book: ', error);
    }
    return null;
  }

  return data;
}

/**
 * 書籍情報を更新する
 * @param id 更新する書籍のID
 * @param input 更新する情報
 * @returns 更新された書籍情報、またはエラー時にnull
 */
export async function updateBook(id: string, input: UpdateBookInput): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to update book: ', error);
    return null;
  }

  return data;
}

/**
 * 書籍を削除する
 * @param id 削除する書籍のID
 * @returns 削除成功時はtrue、失敗時はfalse
 */
export async function deleteBook(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete book: ', error);
    return false;
  }

  return true;
}
