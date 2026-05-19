import React, { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import AITaskAssistant from './AITaskAssistant';
import EmailReminder from './EmailReminder';
import StudyTimer from './StudyTimer';
import ProgressAnalytics from './ProgressAnalytics';
import CalendarView from './CalendarView';

export default function Dashboard({ user }) {
  const { tasks, xp, studyTime = 0, getAnalytics, addStudyTime } = useTasks(user);
  const [analytics, setAnalytics] = useState({ byPriority: {}, byCategory: {} });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  
  useEffect(() => {
    if (getAnalytics) {
      setAnalytics(getAnalytics());
    }
    // Set random motivation message
    const messages = [
      "🎯 Stay focused on your goals!",
      "📚 Every small step counts towards success!",
      "⭐ You're doing great! Keep going!",
      "💪 Believe in yourself and your abilities!",
      "🎓 Your future self will thank you for the hard work!",
      "✨ Progress, not perfection!",
      "🚀 You're capable of amazing things!",
      "📖 One task at a time, you'll get there!"
    ];
    setMotivationMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, [tasks, getAnalytics]);

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const completionRate = tasks.length === 0 ? 0 : ((completed / tasks.length) * 100).toFixed(1);
  
  // Calculate weekly progress
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklyCompleted = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return completedDate >= weekStart;
  }).length;

  // Calculate today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  
  // Calculate upcoming tasks (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingTasksCount = tasks.filter(t => {
    if (t.completed) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= new Date() && dueDate <= nextWeek;
  }).length;

  const stats = [
    { 
      title: "Total Tasks", 
      value: tasks.length, 
      icon: "fas fa-tasks", 
      color: "blue",
      description: "All tasks created"
    },
    { 
      title: "Completed", 
      value: completed, 
      icon: "fas fa-check-circle", 
      color: "green",
      description: `${completionRate}% completion rate`
    },
    { 
      title: "Pending", 
      value: pending, 
      icon: "fas fa-clock", 
      color: "orange",
      description: "Tasks to complete"
    },
    { 
      title: "XP Points", 
      value: xp, 
      icon: "fas fa-star", 
      color: "purple",
      description: "Total XP earned"
    },
    { 
      title: "Study Time", 
      value: `${Math.floor(studyTime / 60)}h ${studyTime % 60}m`, 
      icon: "fas fa-hourglass-half", 
      color: "indigo",
      description: "Focused study time"
    },
  ];

  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const getDaysUntil = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Overdue", color: "text-red-600", bg: "bg-red-50" };
    if (diffDays === 0) return { text: "Today", color: "text-orange-600", bg: "bg-orange-50" };
    if (diffDays === 1) return { text: "Tomorrow", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-blue-600", bg: "bg-blue-50" };
    return { text: `${diffDays} days left`, color: "text-green-600", bg: "bg-green-50" };
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { text: "High", color: "bg-red-100 text-red-700", icon: "fa-exclamation-triangle" },
      medium: { text: "Medium", color: "bg-yellow-100 text-yellow-700", icon: "fa-chart-line" },
      low: { text: "Low", color: "bg-green-100 text-green-700", icon: "fa-check-circle" }
    };
    return badges[priority] || badges.medium;
  };

  const handleStudyLog = () => {
    const minutes = prompt("How many minutes did you study?", "30");
    if (minutes && !isNaN(minutes) && parseInt(minutes) > 0) {
      addStudyTime(parseInt(minutes));
      alert(`🎉 Great job! You earned ${Math.floor(parseInt(minutes) / 10)} XP!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-indigo-100">{motivationMessage}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{weeklyCompleted} tasks</div>
            <div className="text-indigo-200">completed this week</div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
        >
          <i className="fas fa-robot"></i>
          {showAIAssistant ? "Hide" : "Show"} AI Assistant
        </button>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
        >
          <i className="fas fa-calendar-alt"></i>
          {showCalendar ? "Hide" : "Show"} Calendar
        </button>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
        >
          <i className="fas fa-chart-line"></i>
          {showAnalytics ? "Hide" : "Show"} Analytics
        </button>
        <button
          onClick={handleStudyLog}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
        >
          <i className="fas fa-play"></i>
          Log Study Session
        </button>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="animate-fadeIn">
          <AITaskAssistant user={user} tasks={tasks} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <i className={`${stat.icon} text-${stat.color}-600 text-xl`}></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Today's Overview Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-calendar-day text-2xl"></i>
            <h3 className="text-lg font-semibold">Today's Tasks</h3>
          </div>
          <div className="text-3xl font-bold mb-2">{todayTasks.length}</div>
          <p className="text-blue-100 text-sm">
            {todayTasks.length === 0 
              ? "No tasks due today! Enjoy your day! 🎉" 
              : `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} to complete today`}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-calendar-week text-2xl"></i>
            <h3 className="text-lg font-semibold">Upcoming Week</h3>
          </div>
          <div className="text-3xl font-bold mb-2">{upcomingTasksCount}</div>
          <p className="text-purple-100 text-sm">
            Tasks due in the next 7 days
          </p>
        </div>
      </div>

      {/* Calendar View */}
      {showCalendar && (
        <div className="animate-fadeIn">
          <CalendarView tasks={tasks} />
        </div>
      )}

      {/* Progress Analytics */}
      {showAnalytics && (
        <div className="animate-fadeIn">
          <ProgressAnalytics tasks={tasks} />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-600"></i>
            Priority Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.byPriority || { high: 0, medium: 0, low: 0 }).map(([priority, count]) => {
              const percentage = tasks.length === 0 ? 0 : ((count / tasks.length) * 100).toFixed(1);
              const colors = {
                high: { bg: "bg-red-500", light: "bg-red-100", text: "text-red-700" },
                medium: { bg: "bg-yellow-500", light: "bg-yellow-100", text: "text-yellow-700" },
                low: { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" }
              };
              return (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">{priority} Priority</span>
                    <span className="font-semibold text-gray-600">{count} tasks ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${colors[priority]?.bg} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {tasks.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-bold text-green-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                <div 
                  className="h-2 rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-tags text-purple-600"></i>
            Tasks by Category
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analytics.byCategory || { 
              assignment: 0, exam: 0, reading: 0, meeting: 0, other: 0 
            }).map(([category, count]) => {
              const colors = {
                assignment: "bg-blue-100 text-blue-700",
                exam: "bg-red-100 text-red-700",
                reading: "bg-green-100 text-green-700",
                meeting: "bg-purple-100 text-purple-700",
                other: "bg-gray-100 text-gray-700"
              };
              const icons = {
                assignment: "fa-book",
                exam: "fa-graduation-cap",
                reading: "fa-book-open",
                meeting: "fa-users",
                other: "fa-tasks"
              };
              return (
                <div key={category} className={`flex justify-between items-center p-3 rounded-lg ${colors[category] || colors.other}`}>
                  <span className="capitalize flex items-center gap-2">
                    <i className={`fas ${icons[category] || icons.other}`}></i>
                    {category}
                  </span>
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Study Timer Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <StudyTimer user={user} onStudyTimeUpdate={addStudyTime} />
        
        {/* Email Reminder Section */}
        <EmailReminder user={user} tasks={tasks} />
      </div>

      {/* Upcoming Tasks List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-calendar-alt text-indigo-600"></i>
                Upcoming Deadlines
              </h3>
              <p className="text-sm text-gray-500 mt-1">Tasks that need your attention</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                <i className="fas fa-exclamation-circle mr-1"></i>High Priority
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                <i className="fas fa-chart-line mr-1"></i>Medium Priority
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <i className="fas fa-check-circle mr-1"></i>Low Priority
              </span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-check-circle text-5xl mb-3 text-green-400"></i>
              <p className="text-lg">No pending tasks!</p>
              <p className="text-sm">Great job staying on top of your work! 🎉</p>
            </div>
          ) : (
            upcomingTasks.map(task => {
              const daysUntil = getDaysUntil(task.dueDate);
              const priorityBadge = getPriorityBadge(task.priority);
              return (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition group">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                          {task.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge.color}`}>
                          <i className={`fas ${priorityBadge.icon} mr-1`}></i>
                          {priorityBadge.text}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{task.subject}</div>
                      <div className="flex gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          <i className="fas fa-star text-yellow-500 mr-1"></i>
                          +{task.xpReward} XP
                        </span>
                        <span className="text-xs text-gray-500">
                          <i className="fas fa-tag mr-1"></i>
                          {task.category || 'Other'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${daysUntil.color} ${daysUntil.bg} px-3 py-1 rounded-full`}>
                        <i className="far fa-calendar-alt mr-1"></i>
                        {daysUntil.text}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Daily Quote Footer */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 text-center border border-indigo-100">
        <i className="fas fa-quote-left text-indigo-400 text-lg mr-2"></i>
        <span className="text-gray-700 italic">
          "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one."
        </span>
        <i className="fas fa-quote-right text-indigo-400 text-lg ml-2"></i>
        <div className="text-sm text-gray-500 mt-2">— Mark Twain</div>
      </div>
    </div>
  );
}