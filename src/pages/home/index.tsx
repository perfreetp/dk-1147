import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import DecisionCard from '../../components/DecisionCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { decisions } = useAppContext();
  const [activeDecisions, setActiveDecisions] = useState<typeof decisions>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    const active = decisions.filter(d => d.status === 'active');
    const completed = decisions.filter(d => d.status === 'ended');
    setActiveDecisions(active);
    setStats({
      total: decisions.length,
      active: active.length,
      completed: completed.length
    });
  }, [decisions]);

  const handleCreateDecision = () => {
    Taro.switchTab({ url: '/pages/create/index' });
  };

  const handleRandomChoice = () => {
    if (activeDecisions.length === 0) {
      Taro.showToast({
        title: '暂无进行中的决策',
        icon: 'none'
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * activeDecisions.length);
    const randomDecision = activeDecisions[randomIndex];
    const randomOption = randomDecision.options[Math.floor(Math.random() * randomDecision.options.length)];

    Taro.showModal({
      title: '🎲 随机抽签结果',
      content: `${randomDecision.title}: ${randomOption.title}`,
      showCancel: false,
      confirmText: '好的'
    });
  };

  const handleDecisionClick = (decisionId: string) => {
    Taro.navigateTo({
      url: `/pages/result/index?id=${decisionId}`
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.welcomeText}>选择困难中心</Text>
        <Text className={styles.subText}>帮你做出更好的决定</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>总决策</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.active}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={handleCreateDecision}>
          <Text className={styles.actionIcon}>✏️</Text>
          <Text className={styles.actionTitle}>创建选择</Text>
          <Text className={styles.actionDesc}>开始新决策</Text>
        </View>
        <View className={styles.actionCard} onClick={handleRandomChoice}>
          <Text className={styles.actionIcon}>🎲</Text>
          <Text className={styles.actionTitle}>随机抽签</Text>
          <Text className={styles.actionDesc}>让命运决定</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>进行中的决策</Text>
        </View>
        {activeDecisions.length > 0 ? (
          activeDecisions.slice(0, 3).map(decision => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onClick={() => handleDecisionClick(decision.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无进行中的决策</Text>
            <View className={styles.createButton} onClick={handleCreateDecision}>
              <Text className={styles.createButtonText}>立即创建</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
