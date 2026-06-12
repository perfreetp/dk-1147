import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useAppContext } from '../../store/context';
import styles from './index.module.scss';

const SquarePage: React.FC = () => {
  const { squareDecisions, isVoted, addVote } = useAppContext();
  const [searchValue, setSearchValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const votedInfo = isVoted('');
    if (votedInfo) {
      console.info('[Square] User has voted for:', votedInfo.decisionId);
    }
  }, [squareDecisions]);

  const filteredDecisions = squareDecisions.filter(d =>
    d.title.includes(searchValue) || d.description.includes(searchValue)
  );

  const handleSelectOption = (decisionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [decisionId]: optionId
    }));
  };

  const handleVote = (decisionId: string) => {
    const selectedOptionId = selectedOptions[decisionId];
    if (!selectedOptionId) {
      return;
    }

    addVote(decisionId, selectedOptionId);

    const decision = squareDecisions.find(d => d.id === decisionId);
    const selectedOption = decision?.options.find(opt => opt.id === selectedOptionId);

    console.info(`[Square] Vote submitted for: ${selectedOption?.title}`);

    setSelectedOptions(prev => {
      const newState = { ...prev };
      delete newState[decisionId];
      return newState;
    });
  };

  const getVoteStatus = (decisionId: string) => {
    return isVoted(decisionId);
  };

  const getVoteResult = (decisionId: string, optionId: string) => {
    const decision = squareDecisions.find(d => d.id === decisionId);
    if (!decision) return 0;
    return decision.voteResults?.[optionId] || 0;
  };

  const getTotalVotes = (decisionId: string) => {
    const decision = squareDecisions.find(d => d.id === decisionId);
    if (!decision) return 0;
    return decision.voteCount || 0;
  };

  const getPercentage = (decisionId: string, optionId: string) => {
    const total = getTotalVotes(decisionId);
    if (total === 0) return 0;
    const votes = getVoteResult(decisionId, optionId);
    return Math.round((votes / total) * 100);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>投票广场</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            value={searchValue}
            onInput={e => setSearchValue(e.detail.value)}
            placeholder="搜索投票话题..."
            placeholderClass={styles.placeholder}
          />
        </View>
      </View>

      <Text className={styles.sectionTitle}>热门投票</Text>

      <View className={styles.voteList}>
        {filteredDecisions.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无投票内容</Text>
            <Text className={styles.emptySubText}>创建公开选择后会自动显示在这里</Text>
          </View>
        ) : (
          filteredDecisions.map(decision => {
            const votedInfo = getVoteStatus(decision.id);
            const isAlreadyVoted = !!votedInfo;
            const currentSelected = selectedOptions[decision.id];

            return (
              <View key={decision.id} className={styles.voteCard}>
                <View className={styles.voteHeader}>
                  <Text className={styles.voteTitle}>{decision.title}</Text>
                  <View className={styles.voteCount}>
                    <Text className={styles.voteCountText}>
                      {decision.voteCount} 票
                    </Text>
                  </View>
                </View>

                <Text className={styles.voteDescription}>{decision.description}</Text>

                <View className={styles.optionsGrid}>
                  {decision.options.map(option => {
                    const isSelected = currentSelected === option.id;
                    const wasVoted = votedInfo?.optionId === option.id;
                    const votes = getVoteResult(decision.id, option.id);
                    const percentage = getPercentage(decision.id, option.id);

                    return (
                      <View
                        key={option.id}
                        className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''} ${wasVoted ? styles.optionVoted : ''}`}
                        onClick={() => !isAlreadyVoted && handleSelectOption(decision.id, option.id)}
                      >
                        <View className={styles.optionTopRow}>
                          <View className={styles.optionTitleRow}>
                            {wasVoted && <Text className={styles.votedBadge}>✓ 已投</Text>}
                            <Text className={styles.optionTitle}>{option.title}</Text>
                          </View>
                          <Text className={styles.optionVotes}>
                            {votes} 票 ({percentage}%)
                          </Text>
                        </View>
                        <View className={styles.voteBar}>
                          <View
                            className={styles.voteProgress}
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                        <Text className={styles.optionMeta}>
                          优点: {option.pros.join('、')} | 缺点: {option.cons.join('、')}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {isAlreadyVoted ? (
                  <View className={styles.votedBadgeLarge}>
                    <Text className={styles.votedBadgeText}>✓ 已完成投票</Text>
                  </View>
                ) : (
                  <View
                    className={`${styles.voteButton} ${!currentSelected ? styles.voteButtonDisabled : ''}`}
                    onClick={() => {
                      if (!currentSelected) {
                        return;
                      }
                      handleVote(decision.id);
                    }}
                  >
                    <Text className={styles.voteButtonText}>
                      {currentSelected ? '确认投票' : '请先选择选项'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default SquarePage;
