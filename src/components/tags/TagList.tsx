import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tag } from '@/types/tag';
import { ThemedText } from '../ui/ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { ThemedView } from '../ui/ThemedView';

interface TagListProps {
  tags: Tag[];
  onEditTag?: (tag: Tag) => void;
  onDeleteTag?: (tag: Tag) => void;
  testID?: string;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  onEditTag,
  onDeleteTag,
  testID,
}) => {
  return (
    <View testID={testID} style={styles.container}>
      {tags.map((tag) => (
        <ThemedView key={tag.id} style={styles.tagContainer}>
          <ThemedText>{tag.name}</ThemedText>
          {onEditTag && (
            <IconSymbol
              name="pencil"
              size={16}
              onPress={() => onEditTag(tag)}
              testID={`edit-tag-${tag.id}`}
              style={styles.icon}
            />
          )}
          {onDeleteTag && (
            <IconSymbol
              name="trash"
              size={16}
              onPress={() => onDeleteTag(tag)}
              testID={`delete-tag-${tag.id}`}
              style={styles.icon}
            />
          )}
        </ThemedView>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: {
    marginLeft: 4,
  },
});
