
import React, { useState, FormEvent } from 'react';
import { questionnaireQuestions } from '../constants';
import { QuestionnaireAnswers } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface QuestionnaireProps {
  onSubmit: (answers: QuestionnaireAnswers) => void;
  error: string | null;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit, error }) => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    style: 'Modern',
    sqft: '2000',
    bedrooms: '3',
    bathrooms: '2',
    stories: '1',
    features: ['Open Concept', 'Kitchen Island'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAnswers(prev => {
      const newFeatures = checked
        ? [...prev.features, name]
        : prev.features.filter(feature => feature !== name);
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <div className="max-w-2xl mx-auto my-auto p-8 bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Design Your Dream Home</h2>
      <p className="text-center text-gray-400 mb-8">Answer a few questions and our AI will create a starting point for you.</p>
      
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg mb-6">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {questionnaireQuestions.map(q => (
          <div key={q.id}>
            <label htmlFor={q.id} className="block text-sm font-medium text-gray-300 mb-2">{q.label}</label>
            {q.type === 'select' && (
              <select name={q.id} id={q.id} value={answers[q.id as keyof Omit<QuestionnaireAnswers, 'features'>]} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none">
                {q.options?.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            )}
            {q.type === 'text' && <input type="text" name={q.id} id={q.id} placeholder={q.placeholder} value={answers[q.id as keyof Omit<QuestionnaireAnswers, 'features'>]} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none" />}
            {q.type === 'number' && <input type="number" name={q.id} id={q.id} placeholder={q.placeholder} value={answers[q.id as keyof Omit<QuestionnaireAnswers, 'features'>]} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none" />}
            {q.type === 'checkbox' && (
              <div className="grid grid-cols-2 gap-4">
                {q.options?.map(opt => (
                  <label key={opt} className="flex items-center space-x-3 bg-gray-900/80 p-3 rounded-lg border border-gray-700 hover:border-brand-secondary transition-colors cursor-pointer">
                    <input type="checkbox" name={opt} checked={answers.features.includes(opt)} onChange={handleCheckboxChange} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-secondary focus:ring-brand-secondary" />
                    <span className="text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg">
          <SparklesIcon className="w-5 h-5"/>
          Generate My Floor Plan
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;
