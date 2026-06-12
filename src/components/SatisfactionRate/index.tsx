import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SatisfactionRateProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
}

const SatisfactionRate: React.FC<SatisfactionRateProps> = ({
  value,
  onChange,
  readonly = false
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (star: number) => {
    if (!readonly) {
      onChange(star);
    }
  };

  const displayValue = readonly ? value : (hoverValue || value);

  return (
    <View className={styles.container}>
      <Text className={styles.label}>满意度评价</Text>
      <View className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <View
            key={star}
            className={styles.star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onTouchStart={() => !readonly && setHoverValue(star)}
            onTouchEnd={() => !readonly && setHoverValue(0)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
          >
            <Text
              className={
                star <= displayValue ? styles.starFilled : styles.starEmpty
              }
            >
              ★
            </Text>
          </View>
        ))}
      </View>
      <Text className={styles.description}>
        {value === 0 ? '请选择满意度' : getDescription(value)}
      </Text>
    </View>
  );
};

const getDescription = (value: number): string => {
  switch (value) {
    case 1:
      return '非常不满意';
    case 2:
      return '不满意';
    case 3:
      return '一般';
    case 4:
      return '满意';
    case 5:
      return '非常满意';
    default:
      return '';
  }
};

export default SatisfactionRate;
