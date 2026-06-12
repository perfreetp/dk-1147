import React, { createContext, useContext, useState, useEffect } from 'react';
import { Decision, Template, ReportHistory } from '../types/decision';
import { storageService, StoredVote, PendingTemplate } from '../services/storage';
import { mockDecisions, mockTemplates, mockSquareDecisions } from '../data/mock';

interface AppContextType {
  decisions: Decision[];
  squareDecisions: Decision[];
  templates: Template[];
  reportHistory: ReportHistory[];
  votedDecisions: StoredVote[];
  pendingTemplate: PendingTemplate | null;
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  addTemplate: (template: Template) => void;
  useTemplate: (templateId: string) => void;
  addVote: (decisionId: string, optionId: string) => void;
  getDecision: (id: string) => Decision | undefined;
  getSquareDecision: (id: string) => Decision | undefined;
  isVoted: (decisionId: string) => StoredVote | null;
  refreshData: () => void;
  addReport: (report: ReportHistory) => void;
  getReport: (decisionId: string) => ReportHistory | null;
  setPendingTemplate: (template: PendingTemplate | null) => void;
  clearPendingTemplate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [squareDecisions, setSquareDecisions] = useState<Decision[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [votedDecisions, setVotedDecisions] = useState<StoredVote[]>([]);
  const [pendingTemplate, setPendingTemplateState] = useState<PendingTemplate | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    const storedDecisions = storageService.getDecisions();
    let storedSquareDecisions = storageService.getSquareDecisions();
    const storedTemplates = storageService.getTemplates();
    const storedReports = storageService.getReportHistory();
    const storedVoted = storageService.getVotedDecisions();
    const storedPendingTemplate = storageService.getPendingTemplate();

    if (storedDecisions.length === 0) {
      storageService.saveDecisions(mockDecisions);
      setDecisions(mockDecisions);
    } else {
      setDecisions(storedDecisions);
    }

    if (storedSquareDecisions.length === 0) {
      storageService.saveSquareDecisions(mockSquareDecisions);
      setSquareDecisions(mockSquareDecisions);
    } else {
      setSquareDecisions(storedSquareDecisions);
    }

    if (storedTemplates.length === 0) {
      storageService.saveTemplates(mockTemplates);
      setTemplates(mockTemplates);
    } else {
      setTemplates(storedTemplates);
    }

    if (storedReports.length === 0) {
      setReportHistory([]);
    } else {
      setReportHistory(storedReports);
    }

    setVotedDecisions(storedVoted);
    setPendingTemplateState(storedPendingTemplate);
    setIsInitialized(true);
  };

  const refreshData = () => {
    setDecisions(storageService.getDecisions());
    setSquareDecisions(storageService.getSquareDecisions());
    setTemplates(storageService.getTemplates());
    setReportHistory(storageService.getReportHistory());
    setVotedDecisions(storageService.getVotedDecisions());
    setPendingTemplateState(storageService.getPendingTemplate());
  };

  const addDecision = (decision: Decision) => {
    const updatedDecisions = [decision, ...decisions];
    setDecisions(updatedDecisions);
    storageService.saveDecisions(updatedDecisions);

    if (decision.isPublic) {
      const updatedSquare = [decision, ...squareDecisions];
      setSquareDecisions(updatedSquare);
      storageService.saveSquareDecisions(updatedSquare);
    }
  };

  const updateDecision = (id: string, updates: Partial<Decision>) => {
    const updatedDecisions = decisions.map(d =>
      d.id === id ? { ...d, ...updates } : d
    );
    setDecisions(updatedDecisions);
    storageService.saveDecisions(updatedDecisions);

    const squareIndex = squareDecisions.findIndex(d => d.id === id);
    if (squareIndex !== -1) {
      const updatedSquare = squareDecisions.map(d =>
        d.id === id ? { ...d, ...updates } : d
      );
      setSquareDecisions(updatedSquare);
      storageService.saveSquareDecisions(updatedSquare);
    }
  };

  const deleteDecision = (id: string) => {
    const updatedDecisions = decisions.filter(d => d.id !== id);
    setDecisions(updatedDecisions);
    storageService.saveDecisions(updatedDecisions);

    const updatedSquare = squareDecisions.filter(d => d.id !== id);
    setSquareDecisions(updatedSquare);
    storageService.saveSquareDecisions(updatedSquare);
  };

  const addTemplate = (template: Template) => {
    const updatedTemplates = [template, ...templates];
    setTemplates(updatedTemplates);
    storageService.saveTemplates(updatedTemplates);
  };

  const useTemplate = (templateId: string) => {
    const updatedTemplates = templates.map(t =>
      t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    setTemplates(updatedTemplates);
    storageService.saveTemplates(updatedTemplates);
  };

  const addVote = (decisionId: string, optionId: string) => {
    storageService.addVote(decisionId, optionId);
    setVotedDecisions(storageService.getVotedDecisions());

    const updateVoteInDecisions = (decList: Decision[]) => {
      return decList.map(d => {
        if (d.id === decisionId) {
          const voteResults = { ...d.voteResults };
          voteResults[optionId] = (voteResults[optionId] || 0) + 1;

          const today = new Date().toISOString().split('T')[0];
          const voteTrends = d.voteTrends || [];
          const todayTrendIndex = voteTrends.findIndex(t => t.date === today);

          if (todayTrendIndex !== -1) {
            voteTrends[todayTrendIndex].votes = voteTrends[todayTrendIndex].votes.map(v =>
              v.optionId === optionId
                ? { ...v, count: v.count + 1 }
                : v
            );
          } else {
            voteTrends.push({
              date: today,
              votes: d.options.map(opt => ({
                optionId: opt.id,
                count: opt.id === optionId ? 1 : 0
              }))
            });
          }

          return {
            ...d,
            voteCount: d.voteCount + 1,
            voteResults,
            voteTrends
          };
        }
        return d;
      });
    };

    const updatedDecisions = updateVoteInDecisions(decisions);
    setDecisions(updatedDecisions);
    storageService.saveDecisions(updatedDecisions);

    const updatedSquare = updateVoteInDecisions(squareDecisions);
    setSquareDecisions(updatedSquare);
    storageService.saveSquareDecisions(updatedSquare);
  };

  const getDecision = (id: string) => {
    return decisions.find(d => d.id === id);
  };

  const getSquareDecision = (id: string) => {
    return squareDecisions.find(d => d.id === id);
  };

  const isVoted = (decisionId: string) => {
    return votedDecisions.find(v => v.decisionId === decisionId) || null;
  };

  const addReport = (report: ReportHistory) => {
    storageService.addReport(report);
    setReportHistory(storageService.getReportHistory());
  };

  const getReport = (decisionId: string) => {
    return storageService.getReportByDecisionId(decisionId);
  };

  const setPendingTemplate = (template: PendingTemplate | null) => {
    if (template) {
      storageService.savePendingTemplate(template);
    } else {
      storageService.clearPendingTemplate();
    }
    setPendingTemplateState(template);
  };

  const clearPendingTemplate = () => {
    storageService.clearPendingTemplate();
    setPendingTemplateState(null);
  };

  return (
    <AppContext.Provider
      value={{
        decisions,
        squareDecisions,
        templates,
        reportHistory,
        votedDecisions,
        pendingTemplate,
        addDecision,
        updateDecision,
        deleteDecision,
        addTemplate,
        useTemplate,
        addVote,
        getDecision,
        getSquareDecision,
        isVoted,
        refreshData,
        addReport,
        getReport,
        setPendingTemplate,
        clearPendingTemplate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
