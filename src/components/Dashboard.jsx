import React, { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';

export default function Dashboard({ user }) {
  const { tasks, xp, studyTime = 0, getAnalytics, addStudyTime } = useTasks(user);
  const [analytics, setAnalytics] = useState({ byPriority: {}, byCategory: {} });
  
  useEffect(() => {
    if (getAnalytics) {
      setAnalytics(getAnalytics());
    }
  }, [tasks, getAnalytics]);

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklyCompleted = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return completedDate >= weekStart;
  }).length;

  const stats = [
    { title: "Total Tasks", value: tasks.length, icon: "fas fa-tasks", color: "blue" },
    { title: "Completed", value: completed, icon: "fas fa-check-circle", color: "green" },
    { title: "Pending", value: pending, icon: "fas fa-clock", color: "orange" },
    { title: "XP Points", value: xp, icon: "fas fa-star", color: "purple" },
    { title: "Study Time", value: `${Math.floor(studyTime / 60)}h ${studyTime % 60}m`, icon: "fas fa-hourglass-half", color: "indigo" },
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
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    return `${diffDays} days left`;
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
            <p className="text-indigo-100">Keep up the great work! You're making excellent progress.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{weeklyCompleted} tasks</div>
            <div className="text-indigo-200">completed this week</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <i className={`${stat.icon} text-${stat.color}-600 text-xl`}></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-600"></i>
            Priority Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byPriority || { high: 0, medium: 0, low: 0 }).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{priority} Priority</span>
                  <span className="font-semibold">{count} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(count / (tasks.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-tags text-purple-600"></i>
            Tasks by Category
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analytics.byCategory || { assignment: 0, exam: 0, reading: 0, meeting: 0, other: 0 }).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="capitalize text-gray-700">{category}</span>
                <span className="font-bold text-indigo-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-calendar-alt text-indigo-600"></i>
            Upcoming Deadlines
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-check-circle text-4xl mb-2"></i>
              <p>No pending tasks! Great job! 🎉</p>
            </div>
          ) : (
            upcomingTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{task.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{task.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      getDaysUntil(task.dueDate).includes('Overdue') ? 'text-red-600' :
                      getDaysUntil(task.dueDate).includes('Today') ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {getDaysUntil(task.dueDate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Study Timer</h3>
            <p className="text-green-100">Track your study hours and earn XP!</p>
          </div>
          <button 
            onClick={handleStudyLog}
            className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <i className="fas fa-play mr-2"></i>
            Log Study Session
          </button>
        </div>
      </div>
    </div>
  );
}