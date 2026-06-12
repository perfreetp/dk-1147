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
  const [reflection, setReflection] = useState('');
  const [showReflectionModal, setShowReflectionModal] = useState(false);

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
        if (found.reflection) {
          setReflection(found.reflection);
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
      options: optionsWithScores,
      reflection: reflection
    });

    setHasChanges(false);
    Taro.showToast({ title: '决策已保存', icon: 'success' });
  };

  const handleSaveReflection = () => {
    updateDecision(decisionId, { reflection });
    Taro.showToast({ title: '复盘已保存', icon: 'success' });
    setShowReflectionModal(false);
  };

  const handleGenerateReport = () => {
    if (!selectedOption) {
      Taro.showToast({ title: '请先选择最终决定', icon: 'none' });
      return;
    }

    Taro.navigateTo({
      url: `/pages/report-history/index?id=${decisionId}`
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

  const getTrendAnalysis = () => {
    if (!decision?.voteTrends || decision.voteTrends.length === 0) {
      return null;
    }

    const voteResults = decision.voteResults || {};
    const totalVotes = decision.voteCount || 0;

    const optionStats = decision.options.map(opt => {
      const votes = voteResults[opt.id] || 0;
      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      return {
        id: opt.id,
        title: opt.title,
        votes,
        percentage
      };
    });

    optionStats.sort((a, b) => b.votes - a.votes);

    const leader = optionStats[0];
    const secondPlace = optionStats[1];
    const gap = leader && secondPlace ? leader.votes - secondPlace.votes : 0;

    const recentTrends = decision.voteTrends.slice(-3).map(trend => {
      const changes: Record<string, number> = {};
      trend.votes.forEach((v: any) => {
        const prevTrend = decision.voteTrends.find((t: any) =>
          t.date < trend.date && t.votes.find((p: any) => p.optionId === v.optionId)
        );
        const prev = prevTrend?.votes.find((p: any) => p.optionId === v.optionId);
        changes[v.optionId] = prev ? v.count - prev.count : 0;
      });
      return { date: trend.date, votes: trend.votes, changes };
    });

    return {
      optionStats,
      leader,
      gap,
      totalVotes,
      recentTrends
    };
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

  const trendAnalysis = getTrendAnalysis();

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

        {trendAnalysis && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📊 趋势分析</Text>

            <View className={styles.trendSummary}>
              <View className={styles.leaderCard}>
                <Text className={styles.leaderLabel}>🏆 当前领先</Text>
                <Text className={styles.leaderTitle}>{trendAnalysis.leader?.title}</Text>
                <Text className={styles.leaderVotes}>
                  {trendAnalysis.leader?.votes} 票 ({trendAnalysis.leader?.percentage}%)
                  {trendAnalysis.gap > 0 && (
                    <Text className={styles.gapText}> 领先 {trendAnalysis.gap} 票</Text>
                  )}
                </Text>
              </View>
            </View>

            <View className={styles.trendOptions}>
              {trendAnalysis.optionStats.map(opt => (
                <View key={opt.id} className={styles.trendOptionItem}>
                  <View className={styles.trendOptionHeader}>
                    <Text className={styles.trendOptionTitle}>{opt.title}</Text>
                    <View className={styles.trendVotes}>
                      <Text className={styles.trendVoteCount}>{opt.votes}</Text>
                      <Text className={styles.trendVoteLabel}>票 ({opt.percentage}%)</Text>
                    </View>
                  </View>
                  <View className={styles.trendBar}>
                    <View
                      className={styles.trendProgress}
                      style={{
                        width: `${opt.percentage}%`,
                        background: opt.id === trendAnalysis.leader?.id
                          ? 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)'
                          : '#e2e8f0'
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {trendAnalysis.recentTrends.length > 0 && (
              <View className={styles.recentTrend}>
                <Text className={styles.recentLabel}>📅 近期变化（每日增量）</Text>
                {trendAnalysis.recentTrends.map((trend: any, index: number) => (
                  <View key={index} className={styles.dayItem}>
                    <Text className={styles.dayDate}>{trend.date}</Text>
                    <View className={styles.dayVotes}>
                      {trend.changes && Object.entries(trend.changes).map(([optionId, delta]: [string, any]) => {
                        const opt = decision.options?.find((o: any) => o.id === optionId);
                        return (
                          <Text key={optionId} className={delta > 0 ? styles.changeUp : styles.changeDown}>
                            {opt?.title}: {delta > 0 ? '+' : ''}{delta}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

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

        {decision.status === 'ended' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>💭 复盘感想</Text>
              <View
                className={styles.editReflectionButton}
                onClick={() => {
                  setReflection(decision.reflection || '');
                  setShowReflectionModal(true);
                }}
              >
                <Text className={styles.editReflectionText}>
                  {decision.reflection ? '编辑' : '添加'}
                </Text>
              </View>
            </View>
            {decision.reflection ? (
              <Text className={styles.reflectionText}>{decision.reflection}</Text>
            ) : (
              <Text className={styles.noReflectionText}>点击添加你的复盘感想</Text>
            )}
          </View>
        )}

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

      {showReflectionModal && (
        <View className={styles.modal}>
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>💭 复盘感想</Text>
            <View className={styles.reflectionInputContainer}>
              <View
                className={styles.reflectionInput}
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/reflection/index?id=${decisionId}&text=${encodeURIComponent(reflection || '')}`
                  });
                }}
              >
                <Text className={styles.reflectionInputHint}>
                  {reflection || '点击输入复盘感想...'}
                </Text>
              </View>
            </View>
            <View
              className={styles.modalButton}
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/reflection/index?id=${decisionId}&text=${encodeURIComponent(reflection || '')}`
                });
                setShowReflectionModal(false);
              }}
            >
              <Text className={styles.modalButtonText}>编辑复盘</Text>
            </View>
            <View
              className={styles.modalCancelButton}
              onClick={() => setShowReflectionModal(false)}
            >
              <Text className={styles.modalCancelText}>关闭</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ResultPage;
