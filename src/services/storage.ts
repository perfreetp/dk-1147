import Taro from '@tarojs/taro';
import { Decision, ReportHistory } from '../types/decision';

const STORAGE_KEYS = {
  DECISIONS: 'choice_center_decisions',
  SQUARE_DECISIONS: 'choice_center_square',
  VOTED_IDS: 'choice_center_voted',
  TEMPLATES: 'choice_center_templates',
  REPORT_HISTORY: 'choice_center_reports',
  PENDING_TEMPLATE: 'choice_center_pending_template'
};

export interface StoredVote {
  decisionId: string;
  optionId: string;
  votedAt: string;
}

export interface PendingTemplate {
  templateId: string;
  options: string[];
  title: string;
}

class StorageService {
  saveDecisions(decisions: Decision[]): void {
    try {
      Taro.setStorageSync(STORAGE_KEYS.DECISIONS, decisions);
      console.info('[Storage] Decisions saved:', decisions.length);
    } catch (error) {
      console.error('[Storage] Failed to save decisions:', error);
    }
  }

  getDecisions(): Decision[] {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.DECISIONS);
      return data || [];
    } catch (error) {
      console.error('[Storage] Failed to get decisions:', error);
      return [];
    }
  }

  saveSquareDecisions(decisions: Decision[]): void {
    try {
      Taro.setStorageSync(STORAGE_KEYS.SQUARE_DECISIONS, decisions);
      console.info('[Storage] Square decisions saved:', decisions.length);
    } catch (error) {
      console.error('[Storage] Failed to save square decisions:', error);
    }
  }

  getSquareDecisions(): Decision[] {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.SQUARE_DECISIONS);
      return data || [];
    } catch (error) {
      console.error('[Storage] Failed to get square decisions:', error);
      return [];
    }
  }

  saveVotedDecisions(voted: StoredVote[]): void {
    try {
      Taro.setStorageSync(STORAGE_KEYS.VOTED_IDS, voted);
      console.info('[Storage] Voted decisions saved:', voted.length);
    } catch (error) {
      console.error('[Storage] Failed to save voted decisions:', error);
    }
  }

  getVotedDecisions(): StoredVote[] {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.VOTED_IDS);
      return data || [];
    } catch (error) {
      console.error('[Storage] Failed to get voted decisions:', error);
      return [];
    }
  }

  isVoted(decisionId: string): StoredVote | null {
    const voted = this.getVotedDecisions();
    return voted.find(v => v.decisionId === decisionId) || null;
  }

  addVote(decisionId: string, optionId: string): void {
    const voted = this.getVotedDecisions();
    if (!voted.find(v => v.decisionId === decisionId)) {
      voted.push({
        decisionId,
        optionId,
        votedAt: new Date().toISOString()
      });
      this.saveVotedDecisions(voted);
    }
  }

  saveTemplates(templates: any[]): void {
    try {
      Taro.setStorageSync(STORAGE_KEYS.TEMPLATES, templates);
    } catch (error) {
      console.error('[Storage] Failed to save templates:', error);
    }
  }

  getTemplates(): any[] {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.TEMPLATES);
      return data || [];
    } catch (error) {
      console.error('[Storage] Failed to get templates:', error);
      return [];
    }
  }

  saveReportHistory(reports: ReportHistory[]): void {
    try {
      Taro.setStorageSync(STORAGE_KEYS.REPORT_HISTORY, reports);
      console.info('[Storage] Report history saved:', reports.length);
    } catch (error) {
      console.error('[Storage] Failed to save report history:', error);
    }
  }

  getReportHistory(): ReportHistory[] {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.REPORT_HISTORY);
      return data || [];
    } catch (error) {
      console.error('[Storage] Failed to get report history:', error);
      return [];
    }
  }

  addReport(report: ReportHistory): void {
    const reports = this.getReportHistory();
    const existingIndex = reports.findIndex(r => r.decisionId === report.decisionId);
    if (existingIndex !== -1) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    this.saveReportHistory(reports);
  }

  getReportByDecisionId(decisionId: string): ReportHistory | null {
    const reports = this.getReportHistory();
    return reports.find(r => r.decisionId === decisionId) || null;
  }

  savePendingTemplate(template: PendingTemplate): void {
    try {
      Taro.setStorageSync(STORAGE_KEYS.PENDING_TEMPLATE, template);
    } catch (error) {
      console.error('[Storage] Failed to save pending template:', error);
    }
  }

  getPendingTemplate(): PendingTemplate | null {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.PENDING_TEMPLATE);
      return data || null;
    } catch (error) {
      console.error('[Storage] Failed to get pending template:', error);
      return null;
    }
  }

  clearPendingTemplate(): void {
    try {
      Taro.removeStorageSync(STORAGE_KEYS.PENDING_TEMPLATE);
    } catch (error) {
      console.error('[Storage] Failed to clear pending template:', error);
    }
  }

  clearAll(): void {
    try {
      Taro.clearStorageSync();
      console.info('[Storage] All data cleared');
    } catch (error) {
      console.error('[Storage] Failed to clear storage:', error);
    }
  }
}

export const storageService = new StorageService();
