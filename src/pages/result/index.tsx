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
  const [optionScores, setOptionScores] = useState<Record<string, { budget: number; time: number; mood: number }>>({});
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [satisfaction, setSatisfaction] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

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
        const scores: Record<string, { budget: number; time: number; mood: number }> = {};
        found.options?.forEach((opt: any) => {
          scores[opt.id] = opt.score || { budget: 3, time: 3, mood: 3 };
        });
        setOptionScores(scores);
      }
    }
  }, [decisionId, decisions]);

  useEffect(() => {
    if (selectedOption || Object.keys(optionScores).length > 0) {
      setHasChanges(true);
    }
  }, [selectedOption, optionScores]);

  const handleScoreChange = (optionId: string, type: 'budget' | 'time' | 'mood', delta: number) => {
    setOptionScores(prev => {
      const current = prev[optionId] || { budget: 3, time: 3, mood: 3 };
      const newValue = Math.max(1, Math.min(5, current[type] + delta));
      return {
        ...prev,
        [optionId]: {
          ...current,
          [type]: newValue
        }
      };
    });
  };

  const handleSaveDecision = () => {
    if (!selectedOption) {
      Taro.showToast({ title: '请先选择最终决定', icon: 'none' });
      return;
    }

    const optionsWithScores = decision.options.map((opt: any) => ({
      ...opt,
      score: optionScores[opt.id] || { budget: 3, time: 3, mood: 3 }
    }));

    updateDecision(decisionId, {
      finalChoice: selectedOption,
      status: 'ended',
      options: optionsWithScores
    });

    setHasChanges(false);
    Taro.showToast({ title: '决策已保存', icon: 'success' });
  };

  const handleGenerateReport = () => {
    if (!selectedOption) {
      Taro.showToast({ title: '请先选择最终决定', icon: 'none' });
      return;
    }

    const selectedOpt = decision?.options?.find((opt: any) => opt.id === selectedOption);
    const scores = optionScores[selectedOption] || { budget: 3, time: 3, mood: 3 };
    const report = `
📊 选择报告
━━━━━━━━━━━━━━━━━━
📌 ${decision?.title}
${decision?.description ? `📝 ${decision?.description}` : ''}
━━━━━━━━━━━━━━━━━━
✅ 最终选择: ${selectedOpt?.title}

📈 投票结果: ${decision?.voteCount} 票
${decision?.voteResults && Object.keys(decision.voteResults).length > 0 ? `
投票分布:
${decision.options.map((opt: any) => `  • ${opt.title}: ${decision.voteResults?.[opt.id] || 0} 票`).join('\n')}
` : ''}

⭐ 评分（${selectedOpt?.title}）:
  • 预算匹配: ${scores.budget}/5 ${'★'.repeat(scores.budget)}${'☆'.repeat(5-scores.budget)}
  • 时间匹配: ${scores.time}/5 ${'★'.repeat(scores.time)}${'☆'.repeat(5-scores.time)}
  • 心情匹配: ${scores.mood}/5 ${'★'.repeat(scores.mood)}${'☆'.repeat(5-scores.mood)}

📋 选项分析:
${decision?.options.map((opt: any) => `
【${opt.title}】
  ✓ 优点: ${opt.pros?.join('、')}
  ✗ 缺点: ${opt.cons?.join('、')}
`).join('')}
━━━━━━━━━━━━━━━━━━
🕐 生成时间: ${new Date().toLocaleString()}
    `.trim();

    Taro.showModal({
      title: '📊 选择报告',
      content: report,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleSatisfactionSubmit = () => {
    if (satisfaction === 0) {
      Taro.showToast({ title: '请选择满意度', icon: 'none' });
      return;
    }

    updateDecision(decisionId, { satisfaction });
    Taro.showToast({ title: '满意度已记录', icon: 'success' });
    setShowSatisfactionModal(false);
  };

  if (!decision) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.section}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </ScrollView>
    );
  }

  const getVoteResult = (optionId: string) => {
    return decision.voteResults?.[optionId] || 0;
  };

  const getPercentage = (optionId: string) => {
    const total = decision.voteCount || 1;
    const votes = getVoteResult(optionId);
    return Math.round((votes / total) * 100);
  };

  return (
    <View style={{ position: 'relative' }}>
      <ScrollView className={styles.page} scrollY>
        <View className={styles.decisionInfo}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{decision.title}</Text>
            {decision.status === 'ended' && (
              <View className={styles.statusBadge}>
                <Text className={styles.statusText}>已完成</Text>
              </View>
            )}
          </View>
          {decision.description && (
            <Text className={styles.description}>{decision.description}</Text>
          )}
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
            const votes = getVoteResult(option.id);
            const percentage = getPercentage(option.id);
            const isSelected = selectedOption === option.id;

            return (
              <View
                key={option.id}
                className={`${styles.optionResult} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => setSelectedOption(option.id)}
              >
                <View className={styles.optionHeader}>
                  <View className={styles.optionTitleRow}>
                    {isSelected && <Text className={styles.selectedMark}>✓</Text>}
                    <Text className={styles.optionTitle}>{option.title}</Text>
                  </View>
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

        {decision.voteTrends && decision.voteTrends.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>票数趋势</Text>
            <View className={styles.trendContainer}>
              {decision.voteTrends.map((trend: any, index: number) => (
                <View key={index} className={styles.trendItem}>
                  <Text className={styles.trendDate}>{trend.date}</Text>
                  <View className={styles.trendVotes}>
                    {trend.votes.map((v: any, vIndex: number) => {
                      const opt = decision.options?.find((o: any) => o.id === v.optionId);
                      return (
                        <View key={vIndex} className={styles.trendVoteItem}>
                          <Text className={styles.trendOptionName}>{opt?.title}: {v.count}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>选项打分</Text>
          <Text className={styles.scoreHint}>点击 +/- 调整分数（1-5分）</Text>
          {decision.options?.map((option: any) => {
            const scores = optionScores[option.id] || { budget: 3, time: 3, mood: 3 };
            return (
              <View key={option.id} className={styles.scoreCard}>
                <Text className={styles.scoreCardTitle}>{option.title}</Text>
                <View className={styles.scoreRow}>
                  <Text className={styles.scoreLabel}>预算匹配</Text>
                  <View className={styles.scoreControls}>
                    <View
                      className={styles.scoreButton}
                      onClick={() => handleScoreChange(option.id, 'budget', -1)}
                    >
                      <Text className={styles.scoreButtonText}>-</Text>
                    </View>
                    <Text className={styles.scoreValue}>{scores.budget}</Text>
                    <View
                      className={styles.scoreButton}
                      onClick={() => handleScoreChange(option.id, 'budget', 1)}
                    >
                      <Text className={styles.scoreButtonText}>+</Text>
                    </View>
                  </View>
                </View>
                <View className={styles.scoreRow}>
                  <Text className={styles.scoreLabel}>时间匹配</Text>
                  <View className={styles.scoreControls}>
                    <View
                      className={styles.scoreButton}
                      onClick={() => handleScoreChange(option.id, 'time', -1)}
                    >
                      <Text className={styles.scoreButtonText}>-</Text>
                    </View>
                    <Text className={styles.scoreValue}>{scores.time}</Text>
                    <View
                      className={styles.scoreButton}
                      onClick={() => handleScoreChange(option.id, 'time', 1)}
                    >
                      <Text className={styles.scoreButtonText}>+</Text>
                    </View>
                  </View>
                </View>
                <View className={styles.scoreRow}>
                  <Text className={styles.scoreLabel}>心情匹配</Text>
                  <View className={styles.scoreControls}>
                    <View
                      className={styles.scoreButton}
                      onClick={() => handleScoreChange(option.id, 'mood', -1)}
                    >
                      <Text className={styles.scoreButtonText}>-</Text>
                    </View>
                    <Text className={styles.scoreValue}>{scores.mood}</Text>
                    <View
                      className={styles.scoreButton}
                      onClick={() => handleScoreChange(option.id, 'mood', 1)}
                    >
                      <Text className={styles.scoreButtonText}>+</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>最终决定</Text>
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

        {decision.status === 'ended' && decision.satisfaction && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>事后满意度</Text>
            <View className={styles.satisfactionDisplay}>
              <Text className={styles.satisfactionLabel}>评分：</Text>
              <View className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Text
                    key={star}
                    className={star <= decision.satisfaction ? styles.starFilled : styles.starEmpty}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: '220rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={styles.actionButton + ' ' + styles.satisfactionButton}
          onClick={() => setShowSatisfactionModal(true)}
        >
          <Text>满意度</Text>
        </View>
        <View
          className={styles.actionButton + ' ' + styles.reportButton}
          onClick={handleGenerateReport}
        >
          <Text>生成报告</Text>
        </View>
        {hasChanges && (
          <View
            className={styles.actionButton + ' ' + styles.saveButton}
            onClick={handleSaveDecision}
          >
            <Text>保存决定</Text>
          </View>
        )}
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
              className={styles.modalButton}
              onClick={handleSatisfactionSubmit}
            >
              <Text className={styles.modalButtonText}>确认</Text>
            </View>
            <View
              className={styles.modalCancelButton}
              onClick={() => setShowSatisfactionModal(false)}
            >
              <Text className={styles.modalCancelText}>取消</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ResultPage;
