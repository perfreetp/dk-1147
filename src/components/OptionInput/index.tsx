import React from 'react';
import { View, Text, Input } from '@tarojs/components';
import styles from './index.module.scss';

interface OptionInputProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  placeholder?: string;
}

const OptionInput: React.FC<OptionInputProps> = ({
  index,
  value,
  onChange,
  onRemove,
  showRemove = true,
  placeholder = '输入选项'
}) => {
  return (
    <View className={styles.optionContainer}>
      <View className={styles.optionLabel}>
        <Text className={styles.labelText}>选项 {index + 1}</Text>
      </View>
      <View className={styles.inputRow}>
        <Input
          className={styles.input}
          value={value}
          onInput={e => onChange(e.detail.value)}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
        />
        {showRemove && onRemove && (
          <View className={styles.removeBtn} onClick={onRemove}>
            <Text className={styles.removeText}>删除</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OptionInput;
