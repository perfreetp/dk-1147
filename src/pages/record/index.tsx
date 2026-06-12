import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import { Decision, Template } from '../../types/decision';
import DecisionCard from '../../components/DecisionCard';
import styles from './index.module.scss';

const RecordPage: React.FC = () => {
  const { decisions, templates } = useAppContext();
  const [completedDecisions, setCompletedDecisions] = useState<Decision[]>([]);
  const [activeDecisions, setActiveDecisions] = useState<Decision[]>([]);
  const [avgSatisfaction, setAvgSatisfaction] = useState(0);

  useEffect(() => {
    const completed = decisions.filter(d => d.status === 'ended');
    const active = decisions.filter(d => d.status === 'active');
    setCompletedDecisions(completed);
    setActiveDecisions(active);

    const satisfactionSum = completed.reduce((sum, d) => sum + (d.satisfaction || 0), 0);
    const avg = completed.length > 0 ? satisfactionSum / completed.length : 0;
    setAvgSatisfaction(Math.round(avg));
  }, [decisions]);

  const handleDecisionClick = (decisionId: string) => {
    Taro.navigateTo({
      url: `/pages/result/index?id=${decisionId}`
    });
  };

  const handleTemplateUse = (template: Template) => {
    Taro.switchTab({ url: '/pages/create/index' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>个人记录</Text>
        <Text className={styles.subTitle}>回顾你的决策历程</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{completedDecisions.length}</Text>
          <Text className={styles.statLabel}>已完成决策</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{activeDecisions.length}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{avgSatisfaction}</Text>
          <Text className={styles.statLabel}>平均满意度</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{templates.length}</Text>
          <Text className={styles.statLabel}>收藏模板</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>已完成决策</Text>
        </View>
        {completedDecisions.length > 0 ? (
          <View className={styles.decisionList}>
            {completedDecisions.map(decision => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onClick={() => handleDecisionClick(decision.id)}
              />
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无已完成决策</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>收藏模板</Text>
        </View>
        <View className={styles.templateList}>
          {templates.map(template => (
            <View
              key={template.id}
              className={styles.templateCard}
              onClick={() => handleTemplateUse(template)}
            >
              <View className={styles.templateHeader}>
                <Text className={styles.templateTitle}>{template.title}</Text>
                <View className={styles.templateCount}>
                  <Text className={styles.templateCountText}>
                    使用 {template.usageCount} 次
                  </Text>
                </View>
              </View>
              <Text className={styles.templateDesc}>{template.description}</Text>
              <View className={styles.templateOptions}>
                {template.options.map((option, index) => (
                  <View key={index} className={styles.templateOption}>
                    <Text className={styles.templateOptionText}>{option}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordPage;
