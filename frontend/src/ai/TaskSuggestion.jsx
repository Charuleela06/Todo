import React, { useState, useEffect } from 'react';
import { taskSuggestionService } from './taskSuggestionService';

const TaskSuggestion = ({ task, onSuggestionSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSuggestions = async () => {
      if (!task) return;
      
      setIsLoading(true);
      try {
        const optimalTimes = await taskSuggestionService.getOptimalTime(task.duration || 60); // Default to 60 minutes
        setSuggestions(optimalTimes || []);
      } catch (error) {
        console.error('Error getting suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSuggestions();
  }, [task]);

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
        <p className="text-blue-700 dark:text-blue-300 font-medium">
          Analyzing your productivity patterns...
        </p>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI-Powered Suggestions
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Based on your productivity patterns, here are the best times to work on this task:
      </p>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionSelect && onSuggestionSelect(suggestion.hour)}
            className="w-full flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {suggestion.timeString}
            </span>
            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {suggestion.confidence}% confidence
            </span>
          </button>
        ))}
      </div>
      
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Suggestions improve as you complete more tasks. The more you use Todo, the better they get!
      </p>
    </div>
  );
};

export default TaskSuggestion;
