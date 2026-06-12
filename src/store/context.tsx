import React, { createContext, useContext, useState } from 'react';
import { Decision, Template } from '../types/decision';
import { mockDecisions, mockTemplates } from '../data/mock';

interface AppContextType {
  decisions: Decision[];
  templates: Template[];
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  addTemplate: (template: Template) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decisions, setDecisions] = useState<Decision[]>(mockDecisions);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);

  const addDecision = (decision: Decision) => {
    setDecisions(prev => [decision, ...prev]);
  };

  const updateDecision = (id: string, updates: Partial<Decision>) => {
    setDecisions(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
  };

  const addTemplate = (template: Template) => {
    setTemplates(prev => [template, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        decisions,
        templates,
        addDecision,
        updateDecision,
        deleteDecision,
        addTemplate
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
