export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type CreateTagInput = Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

export type UpdateTagInput = Partial<CreateTagInput>;

export type TagColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';
