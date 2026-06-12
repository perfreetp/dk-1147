import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface VoteButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

const VoteButton: React.FC<VoteButtonProps> = ({
  text,
  onClick,
  disabled = false,
  selected = false
}) => {
  return (
    <View
      className={`${styles.button} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <Text className={styles.buttonText}>{text}</Text>
    </View>
  );
};

export default VoteButton;
