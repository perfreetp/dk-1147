import React, { useState } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import styles from './index.module.scss';

const ReflectionPage: React.FC = () => {
  const { decisions, updateDecision } = useAppContext();
  const [reflectionText, setReflectionText] = useState('');

  React.useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params;
    if (params?.text) {
      setReflectionText(decodeURIComponent(params.text));
    } else if (params?.id) {
      const decision = decisions.find(d => d.id === params.id);
      if (decision?.reflection) {
        setReflectionText(decision.reflection);
      }
    }
  }, []);

  const handleSave = () => {
    const params = Taro.getCurrentInstance()?.router?.params;
    if (params?.id) {
      updateDecision(params.id, { reflection: reflectionText });
      Taro.showToast({ title: '复盘已保存', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>💭 复盘感想</Text>
        <Text className={styles.subtitle}>
          记录你做这个决定后的真实感受和经验教训
        </Text>
      </View>

      <View className={styles.content}>
        <Textarea
          className={styles.textarea}
          value={reflectionText}
          onInput={e => setReflectionText(e.detail.value)}
          placeholder="在这里写下你的复盘感想...
          
例如：
• 这个决定做得怎么样？
• 有哪些收获或教训？
• 下次遇到类似情况会怎么做？"
          placeholderClass={styles.placeholder}
          maxlength={500}
        />
        <Text className={styles.charCount}>
          {reflectionText.length} / 500
        </Text>
      </View>

      <View className={styles.tips}>
        <Text className={styles.tipsTitle}>复盘小提示 ✨</Text>
        <Text className={styles.tipsText}>
          • 记录决策过程中的思考
        </Text>
        <Text className={styles.tipsText}>
          • 总结经验教训
        </Text>
        <Text className={styles.tipsText}>
          • 为未来决策提供参考
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.saveButton} onClick={handleSave}>
          <Text className={styles.saveButtonText}>保存复盘</Text>
        </View>
      </View>
    </View>
  );
};

export default ReflectionPage;
