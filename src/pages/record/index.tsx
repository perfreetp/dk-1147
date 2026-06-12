import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import { Decision, Template } from '../../types/decision';
import styles from './index.module.scss';

const RecordPage: React.FC = () => {
  const { decisions, templates, useTemplate, reportHistory, setPendingTemplate } = useAppContext();
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
  }, [decisions, templates]);

  const handleDecisionClick = (decisionId: string) => {
    Taro.navigateTo({
      url: `/pages/result/index?id=${decisionId}`
    });
  };

  const handleReflectionClick = (decisionId: string) => {
    const decision = decisions.find(d => d.id === decisionId);
    Taro.navigateTo({
      url: `/pages/reflection/index?id=${decisionId}&text=${encodeURIComponent(decision?.reflection || '')}`
    });
  };

  const handleReportClick = (decisionId: string) => {
    Taro.navigateTo({
      url: `/pages/report-history/index?id=${decisionId}`
    });
  };

  const handleTemplateUse = (template: Template) => {
    setPendingTemplate({
      templateId: template.id,
      options: template.options,
      title: template.title
    });

    Taro.switchTab({ url: '/pages/create/index' });

    Taro.showToast({
      title: '模板已带入',
      icon: 'success'
    });
  };

  const getFinalChoiceTitle = (decision: Decision) => {
    if (!decision.finalChoice) return '未选择';
    const option = decision.options.find(opt => opt.id === decision.finalChoice);
    return option?.title || '未知选项';
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
          <Text className={styles.statNumber}>{avgSatisfaction || '-'}</Text>
          <Text className={styles.statLabel}>平均满意度</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{reportHistory.length}</Text>
          <Text className={styles.statLabel}>报告历史</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>已完成决策</Text>
        </View>
        {completedDecisions.length > 0 ? (
          <View className={styles.decisionList}>
            {completedDecisions.map(decision => (
              <View
                key={decision.id}
                className={styles.completedCard}
              >
                <View
                  className={styles.cardContent}
                  onClick={() => handleDecisionClick(decision.id)}
                >
                  <View className={styles.completedHeader}>
                    <Text className={styles.completedTitle}>{decision.title}</Text>
                    <View className={styles.completedBadge}>
                      <Text className={styles.completedBadgeText}>已完成</Text>
                    </View>
                  </View>
                  {decision.finalChoice && (
                    <View className={styles.finalChoice}>
                      <Text className={styles.finalChoiceLabel}>最终选择：</Text>
                      <Text className={styles.finalChoiceValue}>{getFinalChoiceTitle(decision)}</Text>
                    </View>
                  )}
                  <View className={styles.completedMeta}>
                    <Text className={styles.completedMetaText}>
                      {decision.options.length} 个选项 · {decision.voteCount} 票
                    </Text>
                  </View>
                  {decision.satisfaction && (
                    <View className={styles.satisfaction}>
                      <Text className={styles.satisfactionLabel}>满意度：</Text>
                      <View className={styles.starsContainer}>
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
                  {decision.reflection && (
                    <View className={styles.reflectionPreview}>
                      <Text className={styles.reflectionPreviewText}>
                        💭 {decision.reflection.substring(0, 50)}
                        {decision.reflection.length > 50 ? '...' : ''}
                      </Text>
                    </View>
                  )}
                </View>
                <View className={styles.actionButtons}>
                  <View
                    className={styles.actionButton}
                    onClick={() => handleReflectionClick(decision.id)}
                  >
                    <Text className={styles.actionButtonText}>
                      {decision.reflection ? '📝 复盘' : '💭 复盘'}
                    </Text>
                  </View>
                  <View
                    className={styles.actionButton + ' ' + styles.actionButtonPrimary}
                    onClick={() => handleReportClick(decision.id)}
                  >
                    <Text className={styles.actionButtonTextPrimary}>
                      📊 报告
                    </Text>
                  </View>
                </View>
              </View>
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
            >
              <View
                className={styles.templateContent}
                onClick={() => handleTemplateUse(template)}
              >
                <View className={styles.templateHeader}>
                  <Text className={styles.templateTitle}>{template.title}</Text>
                  <View className={styles.templateCategory}>
                    <Text className={styles.templateCategoryText}>{template.category}</Text>
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
              <View className={styles.templateFooter}>
                <Text className={styles.templateUsageText}>
                  使用 {template.usageCount} 次
                </Text>
                <View
                  className={styles.templateUseButton}
                  onClick={() => handleTemplateUse(template)}
                >
                  <Text className={styles.templateUseButtonText}>立即使用</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordPage;
