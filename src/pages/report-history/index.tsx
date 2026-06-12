import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import { ReportHistory } from '../../types/decision';
import styles from './index.module.scss';

const ReportHistoryPage: React.FC = () => {
  const { decisions, getReport, addReport, reportHistory } = useAppContext();
  const [report, setReport] = useState<ReportHistory | null>(null);
  const [decision, setDecision] = useState<any>(null);

  useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params;
    if (params?.id) {
      const foundDecision = decisions.find(d => d.id === params.id);
      if (foundDecision) {
        setDecision(foundDecision);
        let foundReport = getReport(params.id);

        if (!foundReport && foundDecision.finalChoice) {
          const selectedOpt = foundDecision.options.find((opt: any) => opt.id === foundDecision.finalChoice);
          const scores = selectedOpt?.score || { budget: 3, time: 3, mood: 3 };

          const optionStats = foundDecision.options.map((opt: any) => {
            const votes = foundDecision.voteResults?.[opt.id] || 0;
            return { id: opt.id, title: opt.title, votes };
          }).sort((a: any, b: any) => b.votes - a.votes);
          const maxVotes = Math.max(...optionStats.map((o: any) => o.votes));
          const leader = optionStats.find((o: any) => o.votes === maxVotes);
          const secondPlace = optionStats.filter((o: any) => o.id !== leader?.id)[0];
          const gap = leader && secondPlace ? leader.votes - secondPlace.votes : 0;

          const recentChanges: any[] = [];
          if (foundDecision.voteTrends && foundDecision.voteTrends.length > 1) {
            const trends = foundDecision.voteTrends.slice(-3);
            for (let i = 1; i < trends.length; i++) {
              const changes: Record<string, number> = {};
              trends[i].votes.forEach((v: any) => {
                const prev = trends[i - 1].votes.find((p: any) => p.optionId === v.optionId);
                changes[v.optionId] = Math.max(0, v.count - (prev?.count || 0));
              });
              recentChanges.push({ date: trends[i].date, changes });
            }
          }

          const suggestions: string[] = [];
          if (selectedOpt && leader) {
            if (selectedOpt.title === leader.title) {
              suggestions.push('🎯 你的最终选择与投票结果一致，投票帮你确认了内心的想法');
            } else if (gap > 5) {
              suggestions.push('💡 你选择了投票结果不同的选项，坚持自己的想法也是一种勇气');
            }
          }

          if (gap <= 2) {
            suggestions.push('⚖️ 投票结果非常接近，这是一个艰难的抉择');
          } else if (gap > 10) {
            suggestions.push('📊 投票结果一边倒，某个选项明显更受欢迎');
          }

          const avgScore = (scores.budget + scores.time + scores.mood) / 3;
          if (avgScore >= 4) {
            suggestions.push('✨ 你对这次选择的各项评分都很高，是一个满意的选择');
          } else if (avgScore <= 2) {
            suggestions.push('🤔 多个维度的评分较低，下次决策可以考虑更周全');
          }

          if (scores.budget <= 2) {
            suggestions.push('💰 预算匹配评分较低，下次决策要多考虑经济因素');
          }
          if (scores.time <= 2) {
            suggestions.push('⏰ 时间成本评分较低，决策时需要评估时间投入');
          }
          if (scores.mood <= 2) {
            suggestions.push('😊 心情匹配评分较低，以后要多关注自己的感受');
          }

          if (foundDecision.satisfaction && foundDecision.satisfaction >= 4) {
            suggestions.push('🌟 整体满意度很高，这是一个成功的决策');
          } else if (foundDecision.satisfaction && foundDecision.satisfaction <= 2) {
            suggestions.push('📝 满意度不足，可以记录这次决策的得失供下次参考');
          }

          if (foundDecision.voteCount > 10 && gap <= 3) {
            suggestions.push('🔍 高投票数下差距仍小，说明选项各有优势');
          } else if (foundDecision.voteCount < 5) {
            suggestions.push('👥 投票人数较少，结果可能不够有代表性');
          }

          foundReport = {
            id: `report_${params.id}`,
            decisionId: params.id,
            decisionTitle: foundDecision.title,
            finalChoice: selectedOpt?.title || '',
            voteCount: foundDecision.voteCount || 0,
            voteResults: foundDecision.voteResults || {},
            scores,
            satisfaction: foundDecision.satisfaction,
            reflection: foundDecision.reflection,
            trendSummary: {
              leader: leader?.title || '',
              leaderVotes: leader?.votes || 0,
              gap,
              recentChanges
            },
            suggestions,
            createdAt: new Date().toISOString()
          };

          addReport(foundReport);
        }

        setReport(foundReport);
      }
    }
  }, [decisions]);

  if (!report || !decision) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.loading}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>📊 选择报告</Text>
        <Text className={styles.subTitle}>{decision.title}</Text>
        <Text className={styles.date}>生成时间：{new Date(report.createdAt).toLocaleString()}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>✅ 最终选择</Text>
        <View className={styles.finalChoiceCard}>
          <Text className={styles.finalChoiceTitle}>{report.finalChoice}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📈 投票结果</Text>
        <View className={styles.voteResults}>
          <View className={styles.totalVotes}>
            <Text className={styles.totalVotesNumber}>{report.voteCount}</Text>
            <Text className={styles.totalVotesLabel}>总票数</Text>
          </View>
          <View className={styles.voteList}>
            {decision.options.map((opt: any) => {
              const votes = report.voteResults?.[opt.id] || 0;
              const percentage = report.voteCount > 0 ? Math.round((votes / report.voteCount) * 100) : 0;
              const isFinal = opt.title === report.finalChoice;
              return (
                <View key={opt.id} className={`${styles.voteItem} ${isFinal ? styles.voteItemHighlight : ''}`}>
                  <View className={styles.voteItemHeader}>
                    <Text className={styles.voteItemTitle}>{opt.title}</Text>
                    <Text className={styles.voteItemVotes}>{votes} 票 ({percentage}%)</Text>
                  </View>
                  <View className={styles.voteBar}>
                    <View className={styles.voteProgress} style={{ width: `${percentage}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {report.trendSummary && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📊 趋势摘要</Text>
          <View className={styles.trendSummary}>
            <View className={styles.leaderCard}>
              <Text className={styles.leaderLabel}>🏆 领先选项</Text>
              <Text className={styles.leaderTitle}>{report.trendSummary.leader}</Text>
              <Text className={styles.leaderVotes}>{report.trendSummary.leaderVotes} 票</Text>
              {report.trendSummary.gap > 0 && (
                <Text className={styles.leaderGap}>领先 {report.trendSummary.gap} 票</Text>
              )}
            </View>
            {report.trendSummary.recentChanges.length > 0 && (
              <View className={styles.recentChanges}>
                <Text className={styles.recentChangesTitle}>近期变化</Text>
                {report.trendSummary.recentChanges.map((change: any, index: number) => (
                  <View key={index} className={styles.changeItem}>
                    <Text className={styles.changeDate}>{change.date}</Text>
                    <View className={styles.changeDetails}>
                      {Object.entries(change.changes).map(([optionId, delta]: [string, any]) => {
                        const opt = decision.options.find((o: any) => o.id === optionId);
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
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>⭐ 评分</Text>
        <View className={styles.scoresGrid}>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreLabel}>预算匹配</Text>
            <Text className={styles.scoreValue}>{report.scores.budget}/5</Text>
            <View className={styles.scoreStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} className={star <= report.scores.budget ? styles.starFilled : styles.starEmpty}>★</Text>
              ))}
            </View>
          </View>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreLabel}>时间匹配</Text>
            <Text className={styles.scoreValue}>{report.scores.time}/5</Text>
            <View className={styles.scoreStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} className={star <= report.scores.time ? styles.starFilled : styles.starEmpty}>★</Text>
              ))}
            </View>
          </View>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreLabel}>心情匹配</Text>
            <Text className={styles.scoreValue}>{report.scores.mood}/5</Text>
            <View className={styles.scoreStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} className={star <= report.scores.mood ? styles.starFilled : styles.starEmpty}>★</Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {report.satisfaction && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>😊 满意度评价</Text>
          <View className={styles.satisfactionDisplay}>
            <View className={styles.satisfactionStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} className={star <= report.satisfaction! ? styles.starFilled : styles.starEmpty}>★</Text>
              ))}
            </View>
            <Text className={styles.satisfactionText}>
              {report.satisfaction === 5 ? '非常满意' :
               report.satisfaction === 4 ? '满意' :
               report.satisfaction === 3 ? '一般' :
               report.satisfaction === 2 ? '不满意' : '非常不满意'}
            </Text>
          </View>
        </View>
      )}

      {report.reflection && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>💭 复盘感想</Text>
          <Text className={styles.reflectionText}>{report.reflection}</Text>
        </View>
      )}

      {report.suggestions && report.suggestions.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>💡 复盘建议</Text>
          <View className={styles.suggestionsList}>
            {report.suggestions.map((suggestion, index) => (
              <View key={index} className={styles.suggestionItem}>
                <Text className={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.footerText}>选择困难中心 · 让决策更清晰</Text>
      </View>
    </ScrollView>
  );
};

export default ReportHistoryPage;
