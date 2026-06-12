import Taro from '@tarojs/taro';
import { Decision, VoteTrend } from '../types/decision';

const STORAGE_KEYS = {
  DECISIONS: 'choice_center_decisions',
  SQUARE_DECISIONS: 'choice_center_square',
  VOTED_IDS: 'choice_center_voted',
  TEMPLATES: 'choice_center_templates'
};

export interface StoredVote {
  decisionId: string;
  optionId: string;
  votedAt: string;
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
