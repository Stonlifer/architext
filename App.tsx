import React, { useState, useCallback } from 'react';
import Questionnaire from './components/Questionnaire';
import FloorPlanDesigner from './components/FloorPlanDesigner';
import { FloorPlan, QuestionnaireAnswers } from './types';
import { generateInitialPlan } from './services/geminiService';
import { LogoIcon } from './components/icons/LogoIcon';
import { RobotIcon } from './components/icons/RobotIcon';
import { mockFloorPlan } from './data/mockFloorPlan';

type AppState = 'questionnaire' | 'generating' | 'designing';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('questionnaire');
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionnaireSubmit = useCallback(async (answers: QuestionnaireAnswers) => {
    setAppState('generating');
    setError(null);
    try {
      const plan = await generateInitialPlan(answers);
      setFloorPlan(plan);
      setAppState('designing');
    } catch (e) {
      console.error(e);
      setError('Failed to generate floor plan. Please try again.');
      setAppState('questionnaire');
    }
  }, []);
  
  const handleStartOver = () => {
    setFloorPlan(null);
    setError(null);
    setAppState('questionnaire');
  }

  const handleUseMockPlan = useCallback(() => {
    setFloorPlan(mockFloorPlan);
    setAppState('designing');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'questionnaire':
        return <Questionnaire onSubmit={handleQuestionnaireSubmit} error={error} onUseMock={handleUseMockPlan} />;
      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white animate-fade-in">
            <RobotIcon className="w-24 h-24 text-brand-secondary animate-pulse-slow" />
            <h2 className="mt-4 text-2xl font-semibold">Our AI Architect is Sketching...</h2>
            <p className="mt-2 text-lg text-gray-400 mb-6">Crafting a unique floor plan based on your vision.</p>
            <div className="w-full max-w-md bg-gray-700 rounded-full h-2.5">
              <div className="bg-brand-secondary h-2.5 rounded-full animate-progress"></div>
            </div>
          </div>
        );
      case 'designing':
        return floorPlan && <FloorPlanDesigner initialPlan={floorPlan} onStartOver={handleStartOver} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-brand-light font-sans flex flex-col">
       <header className="w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-brand-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Architext AI</h1>
        </div>
        {appState === 'designing' && (
           <button 
             onClick={handleStartOver}
             className="px-4 py-2 text-sm font-medium text-white bg-brand-secondary hover:bg-blue-500 rounded-lg transition-colors duration-200"
           >
             Start New Plan
           </button>
        )}
      </header>
      <main className="flex-grow p-4 md:p-8 flex flex-col mx-auto container">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;