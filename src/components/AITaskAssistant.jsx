import React, { useState } from 'react';
import geminiService from '../services/geminiService';

export default function AITaskAssistant({ user, tasks, onAddTask }) {
  const [activeTab, setActiveTab] = useState('analyze'); // analyze, chat, plan, suggestions
  const [inputText, setInputText] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);

  // Analyze task and auto-fill form
  const handleAnalyzeTask = async () => {
    if (!inputText) return;
    
    setLoading(true);
    const analysis = await geminiService.analyzeTask(inputText, taskDescription);
    
    if (analysis) {
      setAiResponse(analysis);
      // You can auto-fill the add task form with these suggestions
    }
    setLoading(false);
  };

  // Get AI suggestions
  const handleGetSuggestions = async () => {
    setLoading(true);
    const userContext = {
      subjects: [...new Set(tasks.map(t => t.subject))],
      deadlines: tasks.filter(t => !t.completed).map(t => t.dueDate),
      completedTasks: tasks.filter(t => t.completed).map(t => t.title),
    };
    
    const suggestions = await geminiService.suggestTasks(userContext);
    setSuggestions(suggestions);
    setLoading(false);
  };

  // Generate study plan
  const handleGeneratePlan = async () => {
    setLoading(true);
    const plan = await geminiService.generateStudyPlan(tasks);
    setStudyPlan(plan);
    setLoading(false);
  };

  // Chat with AI
  const handleSendMessage = async () => {
    if (!inputText) return;
    
    setLoading(true);
    const userContext = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      pendingTasks: tasks.filter(t => !t.completed).length,
      totalXP: tasks.reduce((sum, t) => sum + (t.completed ? t.xpReward : 0), 0),
    };
    
    const response = await geminiService.chatWithAI(inputText, userContext);
    
    setChatHistory([
      ...chatHistory,
      { role: 'user', message: inputText },
      { role: 'ai', message: response }
    ]);
    setInputText('');
    setLoading(false);
  };

  // Add suggested task
  const addSuggestedTask = (suggestion) => {
    onAddTask({
      title: suggestion.title,
      subject: suggestion.subject,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: suggestion.priority,
      category: 'assignment',
      xpReward: suggestion.xpReward,
      description: `AI Suggestion: ${suggestion.reason}`
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <i className="fas fa-robot text-2xl"></i>
          <div>
            <h3 className="text-lg font-bold">AI Study Assistant</h3>
            <p className="text-xs text-purple-200">Powered by Google Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {['analyze', 'suggestions', 'plan', 'chat'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className={`mr-1 fas fa-${
              tab === 'analyze' ? 'magic' : 
              tab === 'suggestions' ? 'lightbulb' : 
              tab === 'plan' ? 'calendar' : 'comments'
            }`}></i>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {loading && (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-3xl text-indigo-500 mb-2"></i>
            <p className="text-gray-500">AI is thinking...</p>
          </div>
        )}

        {/* Analyze Task Tab */}
        {activeTab === 'analyze' && !loading && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Complete React project documentation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Add more details about this task..."
              />
            </div>
            <button
              onClick={handleAnalyzeTask}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <i className="fas fa-magic mr-2"></i>
              Analyze with AI
            </button>

            {aiResponse && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🤖 AI Recommendations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suggested Priority:</span>
                    <span className={`font-semibold capitalize ${
                      aiResponse.suggestedPriority === 'high' ? 'text-red-600' :
                      aiResponse.suggestedPriority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {aiResponse.suggestedPriority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suggested Category:</span>
                    <span className="font-semibold text-purple-600 capitalize">
                      {aiResponse.suggestedCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suggested XP Reward:</span>
                    <span className="font-semibold text-indigo-600">
                      +{aiResponse.suggestedXP} XP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Hours:</span>
                    <span className="font-semibold text-blue-600">
                      {aiResponse.estimatedHours} hours
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">💡 Study Tip:</span>
                    <p className="text-gray-700 mt-1">{aiResponse.studyTips}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">📚 Related Topics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiResponse.relatedTopics?.map((topic, i) => (
                        <span key={i} className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === 'suggestions' && !loading && (
          <div className="space-y-4">
            <button
              onClick={handleGetSuggestions}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <i className="fas fa-lightbulb mr-2"></i>
              Generate Smart Suggestions
            </button>

            {suggestions.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-gray-800">AI Recommended Tasks:</h4>
                {suggestions.map((suggestion, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-gray-800">{suggestion.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="fas fa-info-circle mr-1"></i>
                          {suggestion.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => addSuggestedTask(suggestion)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700"
                      >
                        <i className="fas fa-plus mr-1"></i>Add
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {suggestion.priority}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        +{suggestion.xpReward} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Study Plan Tab */}
        {activeTab === 'plan' && !loading && (
          <div className="space-y-4">
            <button
              onClick={handleGeneratePlan}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Generate AI Study Plan
            </button>

            {studyPlan && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg">
                  <p className="text-sm">🎯 Weekly Goal</p>
                  <p className="font-semibold">{studyPlan.weeklyGoal}</p>
                </div>

                <div className="space-y-3">
                  {studyPlan.dailySchedule?.map((day, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-indigo-600">{day.day}</h5>
                      <div className="mt-2">
                        {day.tasks?.map((task, j) => (
                          <div key={j} className="text-sm text-gray-700">• {task}</div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          <i className="far fa-clock mr-1"></i>{day.totalHours} hours
                        </span>
                        <span className="text-xs text-blue-600">{day.tips}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-purple-100 rounded-lg text-center">
                  <i className="fas fa-heart text-purple-600 mr-1"></i>
                  <span className="text-sm text-purple-800">{studyPlan.motivationalMessage}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && !loading && (
          <div className="space-y-4">
            <div className="h-80 overflow-y-auto space-y-3 mb-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <i className="fas fa-comments text-4xl mb-2"></i>
                  <p>Ask me anything about studying, time management, or motivation!</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ask the AI assistant..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}