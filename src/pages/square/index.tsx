import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { mockSquareDecisions } from '../../data/mock';
import { Decision } from '../../types/decision';
import styles from './index.module.scss';

const SquarePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [votedDecisions, setVotedDecisions] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const filteredDecisions = mockSquareDecisions.filter(d =>
    d.title.includes(searchValue) || d.description.includes(searchValue)
  );

  const handleSelectOption = (decisionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [decisionId]: optionId
    }));
  };

  const handleVote = (decisionId: string) => {
    if (!selectedOptions[decisionId]) {
      return;
    }

    setVotedDecisions(prev => new Set([...prev, decisionId]));

    const decision = mockSquareDecisions.find(d => d.id === decisionId);
    if (decision) {
      const selectedOption = decision.options.find(opt => opt.id === selectedOptions[decisionId]);
      if (selectedOption) {
        console.info(`[Square] User voted for: ${selectedOption.title}`);
      }
    }
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
        {filteredDecisions.map(decision => (
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
                const isSelected = selectedOptions[decision.id] === option.id;
                const isVoted = votedDecisions.has(decision.id);

                return (
                  <View
                    key={option.id}
                    className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''}`}
                    onClick={() => !isVoted && handleSelectOption(decision.id, option.id)}
                  >
                    <Text className={styles.optionTitle}>{option.title}</Text>
                    <Text className={styles.optionMeta}>
                      优点: {option.pros.join('、')} | 缺点: {option.cons.join('、')}
                    </Text>
                  </View>
                );
              })}
            </View>

            {votedDecisions.has(decision.id) ? (
              <View className={styles.votedBadge}>
                <Text className={styles.votedBadgeText}>✓ 已投票</Text>
              </View>
            ) : (
              <View
                className={styles.voteButton}
                onClick={() => handleVote(decision.id)}
              >
                <Text className={styles.voteButtonText}>投票</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default SquarePage;
