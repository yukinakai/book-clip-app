import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tag } from '@/types/tag';
import { ThemedText } from '../ui/ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { ThemedView } from '../ui/ThemedView';

interface TagListProps {
  tags: Tag[];
  selectedTags?: string[];
  onTagPress?: (tag: Tag) => void;
  onEditTag?: (tag: Tag) => void;
  onDeleteTag?: (tag: Tag) => void;
  showActions?: boolean;
  testID?: string;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  selectedTags = [],
  onTagPress,
  onEditTag,
  onDeleteTag,
  showActions = true,
  testID,
}) => {
  return (
    <View testID={testID} style={styles.container}>
      {tags.map((tag) => (
        <ThemedView
          key={tag.id}
          style={[
            styles.tagContainer,
            selectedTags.includes(tag.id) && styles.selectedTag,
          ]}
          onPress={onTagPress ? () => onTagPress(tag) : undefined}
        >
          <ThemedText>{tag.name}</ThemedText>
          {showActions && onEditTag && (
            <IconSymbol
              name="pencil"
              size={16}
              onPress={() => onEditTag(tag)}
              testID={`edit-tag-${tag.id}`}
              style={styles.icon}
            />
          )}
          {showActions && onDeleteTag && (
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
  selectedTag: {
    backgroundColor: '#007AFF20',
  },
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
