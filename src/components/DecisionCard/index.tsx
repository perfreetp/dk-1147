import React from 'react';
import { View, Text } from '@tarojs/components';
import { Decision } from '../../types/decision';
import styles from './index.module.scss';

interface DecisionCardProps {
  decision: Decision;
  onClick?: () => void;
}

const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onClick }) => {
  const getStatusText = () => {
    switch (decision.status) {
      case 'active':
        return '进行中';
      case 'ended':
        return '已结束';
      case 'draft':
        return '草稿';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (decision.status) {
      case 'active':
        return styles.statusActive;
      case 'ended':
        return styles.statusEnded;
      case 'draft':
        return styles.statusDraft;
      default:
        return '';
    }
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{decision.title}</Text>
        <View className={getStatusClass()}>
          <Text className={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <Text className={styles.description}>{decision.description}</Text>

      <View className={styles.meta}>
        <Text className={styles.metaText}>
          {decision.options.length} 个选项 · {decision.voteCount} 票
        </Text>
        <Text className={styles.metaText}>
          截止 {decision.deadline}
        </Text>
      </View>

      {decision.status === 'ended' && decision.satisfaction && (
        <View className={styles.satisfaction}>
          <Text className={styles.satisfactionLabel}>满意度：</Text>
          <View className={styles.satisfactionStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Text
                key={star}
                className={
                  star <= decision.satisfaction!
                    ? styles.starFilled
                    : styles.starEmpty
                }
              >
                ★
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default DecisionCard;
