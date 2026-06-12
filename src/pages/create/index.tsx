import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '../../store/context';
import { Decision, DecisionOption, TemplateCategory } from '../../types/decision';
import styles from './index.module.scss';

interface OptionForm {
  title: string;
  pros: string;
  cons: string;
}

const CATEGORIES: TemplateCategory[] = ['全部', '生活', '购物', '出行', '工作', '其他'];

const CreatePage: React.FC = () => {
  const { addDecision, templates, useTemplate, pendingTemplate, setPendingTemplate, clearPendingTemplate } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<OptionForm[]>([
    { title: '', pros: '', cons: '' },
    { title: '', pros: '', cons: '' }
  ]);
  const [deadline, setDeadline] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('全部');
  const [searchValue, setSearchValue] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  useEffect(() => {
    if (pendingTemplate) {
      const templateOptions: OptionForm[] = pendingTemplate.options.map((opt: string) => ({
        title: opt,
        pros: '',
        cons: ''
      }));
      setOptions(templateOptions.length >= 2 ? templateOptions : [
        ...templateOptions,
        { title: '', pros: '', cons: '' }
      ]);
      useTemplate(pendingTemplate.id);
      clearPendingTemplate();
    }
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchCategory = selectedCategory === '全部' || t.category === selectedCategory;
    const matchSearch = !searchValue || t.title.includes(searchValue) || t.description.includes(searchValue);
    return matchCategory && matchSearch;
  });

  const handleAddOption = () => {
    if (options.length >= 5) {
      Taro.showToast({
        title: '最多添加5个选项',
        icon: 'none'
      });
      return;
    }
    setOptions([...options, { title: '', pros: '', cons: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      Taro.showToast({
        title: '至少保留2个选项',
        icon: 'none'
      });
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof OptionForm, value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleSelectTemplate = (template: any) => {
    setPreviewTemplate(template);
  };

  const handleConfirmTemplate = () => {
    if (!previewTemplate) return;

    const templateOptions: OptionForm[] = previewTemplate.options.map((opt: string) => ({
      title: opt,
      pros: '',
      cons: ''
    }));
    setOptions(templateOptions.length >= 2 ? templateOptions : [
      ...templateOptions,
      { title: '', pros: '', cons: '' }
    ]);

    useTemplate(previewTemplate.id);

    setShowTemplateModal(false);
    setPreviewTemplate(null);

    Taro.showToast({
      title: '模板已应用',
      icon: 'success'
    });
  };

  const handleCancelPreview = () => {
    setPreviewTemplate(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入决策标题', icon: 'none' });
      return;
    }

    const validOptions = options.filter(opt => opt.title.trim());
    if (validOptions.length < 2) {
      Taro.showToast({ title: '至少需要2个有效选项', icon: 'none' });
      return;
    }

    if (!deadline) {
      Taro.showToast({ title: '请设置截止时间', icon: 'none' });
      return;
    }

    const decisionOptions: DecisionOption[] = validOptions.map((opt, index) => ({
      id: `opt${Date.now()}_${index}`,
      title: opt.title.trim(),
      pros: opt.pros.split('、').filter(p => p.trim()),
      cons: opt.cons.split('、').filter(c => c.trim())
    }));

    const voteResults: Record<string, number> = {};
    decisionOptions.forEach(opt => {
      voteResults[opt.id] = 0;
    });

    const newDecision: Decision = {
      id: `decision_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      options: decisionOptions,
      voteResults,
      voteTrends: [],
      deadline,
      status: 'active',
      isPublic,
      voteCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    addDecision(newDecision);

    Taro.showToast({
      title: '决策创建成功',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1500);
  };

  return (
    <View style={{ position: 'relative' }}>
      <ScrollView className={styles.page} scrollY>
        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>决策信息</Text>
          <View className={styles.inputGroup}>
            <Text className={styles.label}>决策标题</Text>
            <Input
              className={styles.input}
              value={title}
              onInput={e => setTitle(e.detail.value)}
              placeholder="例如：周末去哪里玩？"
              placeholderClass={styles.placeholder}
            />
          </View>
          <View className={styles.inputGroup}>
            <Text className={styles.label}>详细描述（可选）</Text>
            <Textarea
              className={styles.textarea}
              value={description}
              onInput={e => setDescription(e.detail.value)}
              placeholder="补充更多背景信息，让决策更清晰..."
              placeholderClass={styles.placeholder}
            />
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.templateHeader}>
            <Text className={styles.sectionTitle}>选项设置</Text>
            <View
              className={styles.templateButton}
              onClick={() => setShowTemplateModal(true)}
            >
              <Text className={styles.templateButtonText}>📋 从模板选择</Text>
            </View>
          </View>
          <View className={styles.optionsList}>
            {options.map((option, index) => (
              <View key={index} className={styles.optionCard}>
                <View className={styles.optionHeader}>
                  <Text className={styles.optionTitle}>选项 {index + 1}</Text>
                  {options.length > 2 && (
                    <View
                      className={styles.removeOption}
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Text className={styles.removeIcon}>✕</Text>
                    </View>
                  )}
                </View>
                <Input
                  className={styles.optionInput}
                  value={option.title}
                  onInput={e => handleOptionChange(index, 'title', e.detail.value)}
                  placeholder="选项名称"
                  placeholderClass={styles.placeholder}
                />
                <Text className={styles.tagsHint}>优点（用顿号分隔，如：好吃、省时）</Text>
                <Input
                  className={styles.tagsInput}
                  value={option.pros}
                  onInput={e => handleOptionChange(index, 'pros', e.detail.value)}
                  placeholder="例如：好吃、省时"
                  placeholderClass={styles.placeholder}
                />
                <Text className={styles.tagsHint} style={{ marginTop: '8rpx' }}>缺点（用顿号分隔，如：贵、远）</Text>
                <Input
                  className={styles.tagsInput}
                  value={option.cons}
                  onInput={e => handleOptionChange(index, 'cons', e.detail.value)}
                  placeholder="例如：贵、远"
                  placeholderClass={styles.placeholder}
                />
              </View>
            ))}
          </View>
          {options.length < 5 && (
            <View className={styles.addOption} onClick={handleAddOption}>
              <Text className={styles.addOptionText}>+ 添加选项</Text>
            </View>
          )}
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>投票设置</Text>
          <View className={styles.settingsRow}>
            <View className={styles.settingItem}>
              <Text className={styles.settingLabel}>截止时间</Text>
              <Input
                className={styles.datePicker}
                value={deadline}
                onInput={e => setDeadline(e.detail.value)}
                placeholder="YYYY-MM-DD"
                placeholderClass={styles.placeholder}
              />
            </View>
          </View>
          <View className={styles.switchRow}>
            <View>
              <Text className={styles.switchLabel}>发布到投票广场</Text>
              <Text className={styles.switchDesc}>让陌生人也能帮你投票</Text>
            </View>
            <Switch
              className={styles.publishSwitch}
              checked={isPublic}
              onChange={e => setIsPublic(e.detail.value)}
              color="#6366f1"
            />
          </View>
        </View>

        <View style={{ height: '200rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.saveButton} onClick={handleSave}>
          <Text className={styles.saveButtonText}>保存并发布</Text>
        </View>
      </View>

      {showTemplateModal && (
        <View className={styles.modal}>
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>📋 选择模板</Text>

            <View className={styles.searchBar}>
              <Input
                className={styles.searchInput}
                value={searchValue}
                onInput={e => setSearchValue(e.detail.value)}
                placeholder="搜索模板..."
                placeholderClass={styles.placeholder}
              />
            </View>

            <View className={styles.categoryTabs}>
              {CATEGORIES.map(cat => (
                <View
                  key={cat}
                  className={`${styles.categoryTab} ${selectedCategory === cat ? styles.categoryTabActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <Text className={`${styles.categoryTabText} ${selectedCategory === cat ? styles.categoryTabTextActive : ''}`}>
                    {cat}
                  </Text>
                </View>
              ))}
            </View>

            {previewTemplate ? (
              <View className={styles.previewContainer}>
                <View className={styles.previewHeader}>
                  <Text className={styles.previewTitle}>📝 {previewTemplate.title}</Text>
                  <Text className={styles.previewDesc}>{previewTemplate.description}</Text>
                </View>
                <View className={styles.previewOptions}>
                  <Text className={styles.previewLabel}>选项预览：</Text>
                  {previewTemplate.options.map((opt: string, index: number) => (
                    <View key={index} className={styles.previewOption}>
                      <Text className={styles.previewOptionText}>{index + 1}. {opt}</Text>
                    </View>
                  ))}
                </View>
                <View className={styles.previewActions}>
                  <View
                    className={styles.previewCancelButton}
                    onClick={handleCancelPreview}
                  >
                    <Text className={styles.previewCancelText}>取消</Text>
                  </View>
                  <View
                    className={styles.previewConfirmButton}
                    onClick={handleConfirmTemplate}
                  >
                    <Text className={styles.previewConfirmText}>确认带入</Text>
                  </View>
                </View>
              </View>
            ) : (
              <ScrollView className={styles.templateList} scrollY>
                {filteredTemplates.map(template => (
                  <View
                    key={template.id}
                    className={styles.templateItem}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <View className={styles.templateInfo}>
                      <View className={styles.templateTitleRow}>
                        <Text className={styles.templateName}>{template.title}</Text>
                        <View className={styles.templateCategory}>
                          <Text className={styles.templateCategoryText}>{template.category}</Text>
                        </View>
                      </View>
                      <Text className={styles.templateDesc}>{template.description}</Text>
                      <View className={styles.templateOptions}>
                        {template.options.map((opt: string, index: number) => (
                          <View key={index} className={styles.templateOption}>
                            <Text className={styles.templateOptionText}>{opt}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View className={styles.templateUsage}>
                      <Text className={styles.templateUsageText}>
                        使用 {template.usageCount} 次
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View
              className={styles.modalCancelButton}
              onClick={() => {
                setShowTemplateModal(false);
                setPreviewTemplate(null);
              }}
            >
              <Text className={styles.modalCancelText}>关闭</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreatePage;
