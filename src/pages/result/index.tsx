import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import SatisfactionRate from '../../components/SatisfactionRate';
import styles from './index.module.scss';

const ResultPage: React.FC = () => {
  const { decisions, updateDecision } = useAppContext();
  const [decisionId, setDecisionId] = useState('');
  const [decision, setDecision] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [scores, setScores] = useState({ budget: 5, time: 5, mood: 5 });
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params;
    if (params?.id) {
      setDecisionId(params.id);
      const found = decisions.find(d => d.id === params.id);
      if (found) {
        setDecision(found);
        if (found.finalChoice) {
          setSelectedOption(found.finalChoice);
        }
        if (found.satisfaction) {
          setSatisfaction(found.satisfaction);
        }
      }
    }
  }, [decisionId, decisions]);

  const handleGenerateReport = () => {
    if (!selectedOption) {
      Taro.showToast({ title: '请先选择最终决定', icon: 'none' });
      return;
    }

    const selectedOpt = decision?.options?.find((opt: any) => opt.id === selectedOption);
    const report = `
决策报告
━━━━━━━━━━━━━━━
标题: ${decision?.title}
描述: ${decision?.description}
━━━━━━━━━━━━━━━
最终选择: ${selectedOpt?.title}
投票结果: ${decision?.voteCount} 票
━━━━━━━━━━━━━━━
评分:
- 预算匹配: ${scores.budget}/5
- 时间匹配: ${scores.time}/5
- 心情匹配: ${scores.mood}/5
━━━━━━━━━━━━━━━
优点: ${selectedOpt?.pros?.join('、')}
缺点: ${selectedOpt?.cons?.join('、')}
━━━━━━━━━━━━━━━
生成时间: ${new Date().toLocaleString()}
    `.trim();

    Taro.showModal({
      title: '📊 选择报告',
      content: report,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleSaveFinalDecision = () => {
    if (!selectedOption) {
      Taro.showToast({ title: '请选择最终决定', icon: 'none' });
      return;
    }

    updateDecision(decisionId, { finalChoice: selectedOption });
    Taro.showToast({ title: '决策已记录', icon: 'success' });
  };

  const handleSatisfactionSubmit = () => {
    if (satisfaction === 0) {
      Taro.showToast({ title: '请选择满意度', icon: 'none' });
      return;
    }

    updateDecision(decisionId, { satisfaction });
    setShowSatisfactionModal(false);
    Taro.showToast({ title: '满意度已记录', icon: 'success' });
  };

  if (!decision) {
    return (
      <View className={styles.page}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>加载中...</Text>
        </View>
      </View>
    );
  }

  const totalVotes = decision.voteCount || 1;

  return (
    <View style={{ position: 'relative' }}>
      <ScrollView className={styles.page} scrollY>
        <View className={styles.decisionInfo}>
          <Text className={styles.title}>{decision.title}</Text>
          <Text className={styles.description}>{decision.description}</Text>
          <View className={styles.meta}>
            <Text className={styles.metaText}>
              {decision.options?.length} 个选项 · {decision.voteCount} 票
            </Text>
            <Text className={styles.metaText}>截止 {decision.deadline}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>投票结果</Text>
          {decision.options?.map((option: any) => {
            const votes = Math.floor(Math.random() * 30) + 1;
            const percentage = Math.round((votes / (decision.voteCount || 1)) * 100);

            return (
              <View key={option.id} className={styles.optionResult}>
                <View className={styles.optionHeader}>
                  <Text className={styles.optionTitle}>{option.title}</Text>
                  <Text className={styles.optionVotes}>{votes} 票 ({percentage}%)</Text>
                </View>
                <View className={styles.voteBar}>
                  <View
                    className={styles.voteProgress}
                    style={{ width: `${percentage}%` }}
                  />
                </View>
                <View className={styles.prosCons}>
                  <View className={styles.prosList}>
                    <Text className={styles.prosTitle}>✓ 优点</Text>
                    <Text className={styles.prosText}>{option.pros?.join('、')}</Text>
                  </View>
                  <View className={styles.consList}>
                    <Text className={styles.consTitle}>✗ 缺点</Text>
                    <Text className={styles.consText}>{option.cons?.join('、')}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>选项打分</Text>
          <View className={styles.scoreGrid}>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>预算匹配</Text>
              <Text className={styles.scoreValue}>{scores.budget}</Text>
            </View>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>时间匹配</Text>
              <Text className={styles.scoreValue}>{scores.time}</Text>
            </View>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>心情匹配</Text>
              <Text className={styles.scoreValue}>{scores.mood}</Text>
            </View>
          </View>
          <View style={{ display: 'flex', gap: '16rpx', marginTop: '24rpx' }}>
            <View
              className={styles.decisionOption}
              onClick={() => setScores({ ...scores, budget: Math.min(5, scores.budget + 1) })}
            >
              <Text className={styles.decisionOptionText}>预算 +</Text>
            </View>
            <View
              className={styles.decisionOption}
              onClick={() => setScores({ ...scores, time: Math.min(5, scores.time + 1) })}
            >
              <Text className={styles.decisionOptionText}>时间 +</Text>
            </View>
            <View
              className={styles.decisionOption}
              onClick={() => setScores({ ...scores, mood: Math.min(5, scores.mood + 1) })}
            >
              <Text className={styles.decisionOptionText}>心情 +</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>最终决定</Text>
          <View className={styles.decisionSection}>
            <Text className={styles.decisionLabel}>选择最终决定</Text>
            <View className={styles.decisionOptions}>
              {decision.options?.map((option: any) => (
                <View
                  key={option.id}
                  className={`${styles.decisionOption} ${selectedOption === option.id ? styles.decisionOptionSelected : ''}`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <Text className={styles.decisionOptionText}>{option.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: '200rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={styles.actionButton + ' ' + styles.satisfactionButton}
          onClick={() => setShowSatisfactionModal(true)}
        >
          <Text>添加满意度</Text>
        </View>
        <View
          className={styles.actionButton + ' ' + styles.reportButton}
          onClick={handleGenerateReport}
        >
          <Text>生成报告</Text>
        </View>
      </View>

      {showSatisfactionModal && (
        <View className={styles.modal}>
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>事后满意度评价</Text>
            <SatisfactionRate
              value={satisfaction}
              onChange={setSatisfaction}
            />
            <View
              className={styles.closeButton}
              onClick={handleSatisfactionSubmit}
            >
              <Text className={styles.closeButtonText}>确认</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ResultPage;
