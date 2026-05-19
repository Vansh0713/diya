import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import geminiService from '../services/geminiService';

export default function TaskManager({ user }) {
  const { tasks, addTask, toggleTask, deleteTask, editTask } = useTasks(user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [xpRange, setXpRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState('list');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'assignment',
    xpReward: 20,
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        subject: task.subject,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category || 'assignment',
        xpReward: task.xpReward,
        description: task.description || '',
        tags: task.tags || []
      });
      setTagInput('');
      setAiSuggestions(null);
      setShowAIAnalysis(false);
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        subject: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        category: 'assignment',
        xpReward: 20,
        description: '',
        tags: []
      });
      setTagInput('');
      setAiSuggestions(null);
      setShowAIAnalysis(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setAiSuggestions(null);
    setShowAIAnalysis(false);
  };

  const analyzeWithAI = async () => {
    if (!formData.title) {
      alert('Please enter a task title first');
      return;
    }
    
    setAiLoading(true);
    const analysis = await geminiService.analyzeTask(formData.title, formData.description);
    
    if (analysis) {
      setAiSuggestions(analysis);
      setFormData({
        ...formData,
        priority: analysis.suggestedPriority || formData.priority,
        category: analysis.suggestedCategory || formData.category,
        xpReward: analysis.suggestedXP || formData.xpReward,
      });
      setShowAIAnalysis(true);
    } else {
      alert('AI analysis failed. Please try again.');
    }
    setAiLoading(false);
  };

  const getAISubtasks = async () => {
    if (!formData.title) return;
    
    setAiLoading(true);
    const subtasks = await geminiService.breakDownTask(formData.title, formData.description);
    
    if (subtasks && subtasks.length > 0) {
      alert(`AI Suggested Subtasks:\n${subtasks.map((s, i) => `${i+1}. ${s.title} (${s.estimatedMinutes} min)`).join('\n')}`);
    }
    setAiLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const taskData = {
      title: formData.title,
      subject: formData.subject || 'General',
      dueDate: formData.dueDate,
      priority: formData.priority,
      category: formData.category,
      xpReward: parseInt(formData.xpReward),
      description: formData.description,
      tags: formData.tags
    };
    
    if (editingTask) {
      editTask({ ...editingTask, ...taskData });
    } else {
      addTask(taskData);
    }
    closeModal();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: 'fa-exclamation-triangle',
      medium: 'fa-chart-line',
      low: 'fa-check-circle'
    };
    return icons[priority] || icons.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      assignment: 'fa-book',
      exam: 'fa-graduation-cap',
      reading: 'fa-book-open',
      meeting: 'fa-users',
      other: 'fa-tasks'
    };
    return icons[category] || icons.other;
  };

  const getCategoryColor = (category) => {
    const colors = {
      assignment: 'bg-blue-100 text-blue-700',
      exam: 'bg-red-100 text-red-700',
      reading: 'bg-green-100 text-green-700',
      meeting: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.other;
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due Today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
    return { text: `${diffDays} days left`, color: 'text-green-600' };
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task => categoryFilter === 'all' || task.category === categoryFilter)
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(task => {
      if (dateRange.start && task.dueDate < dateRange.start) return false;
      if (dateRange.end && task.dueDate > dateRange.end) return false;
      return true;
    })
    .filter(task => {
      if (xpRange.min && task.xpReward < parseInt(xpRange.min)) return false;
      if (xpRange.max && task.xpReward > parseInt(xpRange.max)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'xp') return b.xpReward - a.xpReward;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
    totalXP: tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.xpReward || 0), 0)
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setFilter('all');
    setSortBy('dueDate');
    setDateRange({ start: '', end: '' });
    setXpRange({ min: '', max: '' });
    setShowAdvancedFilters(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <i className="fas fa-tasks text-2xl opacity-50"></i>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <i className="fas fa-check-circle text-2xl opacity-50"></i>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <i className="fas fa-clock text-2xl opacity-50"></i>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">High Priority</p>
              <p className="text-2xl font-bold">{stats.highPriority}</p>
            </div>
            <i className="fas fa-exclamation-triangle text-2xl opacity-50"></i>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Total XP</p>
              <p className="text-2xl font-bold">{stats.totalXP}</p>
            </div>
            <i className="fas fa-star text-2xl opacity-50"></i>
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            <i className="fas fa-list"></i>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            <i className="fas fa-th"></i>
          </button>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add New Task
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search tasks by title, subject, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Categories</option>
              <option value="assignment">📝 Assignments</option>
              <option value="exam">📚 Exams</option>
              <option value="reading">📖 Reading</option>
              <option value="meeting">👥 Meetings</option>
              <option value="other">🎯 Other</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="xp">Sort by XP Reward</option>
              <option value="title">Sort by Title</option>
              <option value="recent">Sort by Recent</option>
            </select>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <i className="fas fa-sliders-h mr-1"></i>
              Filters
            </button>
            
            {(searchTerm || categoryFilter !== 'all' || filter !== 'all' || dateRange.start || dateRange.end || xpRange.min || xpRange.max) && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <i className="fas fa-times mr-1"></i>
                Clear All
              </button>
            )}
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar mr-1"></i> Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="End Date"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-star mr-1"></i> XP Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={xpRange.min}
                    onChange={(e) => setXpRange({...xpRange, min: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Min XP"
                  />
                  <input
                    type="number"
                    value={xpRange.max}
                    onChange={(e) => setXpRange({...xpRange, max: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Max XP"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Found {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
      </div>

      {/* Tasks List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <i className="fas fa-smile-wink text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 text-lg">No tasks found! Create your first task 🚀</p>
              {searchTerm && <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>}
            </div>
          ) : (
            filteredTasks.map(task => {
              const daysUntil = getDaysUntil(task.dueDate);
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl shadow-sm border-l-8 transition-all hover:shadow-md ${
                    task.completed ? 'border-green-400 opacity-75' : 
                    task.priority === 'high' ? 'border-red-500' :
                    task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${
                            task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-500'
                          }`}
                        >
                          {task.completed && <i className="fas fa-check text-xs"></i>}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              <i className={`fas ${getPriorityIcon(task.priority)} mr-1`}></i>
                              {task.priority}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <i className="fas fa-book-open mr-1"></i> {task.subject}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                              <i className={`fas ${getCategoryIcon(task.category)} mr-1`}></i>
                              {task.category || 'other'}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <i className="fas fa-star mr-1"></i> +{task.xpReward} XP
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${daysUntil.color} bg-opacity-10`}>
                              <i className="far fa-calendar-alt mr-1"></i> {daysUntil.text}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                          )}
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map(tag => (
                                <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                  <i className="fas fa-tag mr-1"></i>{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-auto sm:ml-0">
                        <button
                          onClick={() => openModal(task)}
                          className="text-indigo-500 hover:text-indigo-700 p-2 transition"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-600 p-2 transition"
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tasks Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center shadow-sm">
              <i className="fas fa-smile-wink text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 text-lg">No tasks found! Create your first task 🚀</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const daysUntil = getDaysUntil(task.dueDate);
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl shadow-sm border-t-4 transition-all hover:shadow-md ${
                    task.completed ? 'border-green-400 opacity-75' : 
                    task.priority === 'high' ? 'border-red-500' :
                    task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-500'
                        }`}
                      >
                        {task.completed && <i className="fas fa-check text-xs"></i>}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(task)}
                          className="text-indigo-500 hover:text-indigo-700 p-1 transition"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-600 p-1 transition"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                    
                    <h3 className={`font-bold mb-2 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {task.subject}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        <i className="far fa-calendar-alt mr-1"></i> {task.dueDate}
                      </span>
                      <span className={`text-xs font-semibold ${daysUntil.color}`}>
                        {daysUntil.text}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        <i className="fas fa-star mr-1"></i>+{task.xpReward} XP
                      </span>
                      {task.completed && (
                        <span className="text-xs text-green-600">
                          <i className="fas fa-check-circle mr-1"></i>Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add/Edit Task Modal with AI Integration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Complete React Project"
                  />
                  <button
                    type="button"
                    onClick={analyzeWithAI}
                    disabled={aiLoading || !formData.title}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    title="Analyze with AI"
                  >
                    {aiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                  </button>
                  <button
                    type="button"
                    onClick={getAISubtasks}
                    disabled={aiLoading || !formData.title}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    title="Get AI Subtasks"
                  >
                    <i className="fas fa-code-branch"></i>
                  </button>
                </div>
              </div>

              {/* AI Analysis Results */}
              {showAIAnalysis && aiSuggestions && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-robot text-purple-600"></i>
                    <span className="text-sm font-semibold text-purple-700">AI Recommendations Applied</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Priority: <span className="font-semibold capitalize">{aiSuggestions.suggestedPriority}</span></div>
                    <div>Category: <span className="font-semibold capitalize">{aiSuggestions.suggestedCategory}</span></div>
                    <div>XP Reward: <span className="font-semibold">+{aiSuggestions.suggestedXP} XP</span></div>
                    <div>Est. Hours: <span className="font-semibold">{aiSuggestions.estimatedHours}h</span></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    <i className="fas fa-lightbulb text-yellow-500 mr-1"></i>
                    {aiSuggestions.studyTips}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Add task details, resources, or notes..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low 🟢</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="high">High 🔴</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="assignment">📝 Assignment</option>
                    <option value="exam">📚 Exam</option>
                    <option value="reading">📖 Reading</option>
                    <option value="meeting">👥 Meeting</option>
                    <option value="other">🎯 Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({...formData, xpReward: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add tags..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-600"
                          >
                            <i className="fas fa-times-circle text-xs"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}