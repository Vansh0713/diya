import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProgressAnalytics({ tasks }) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(1);
  
  // Priority distribution
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high' && !t.completed).length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium' && !t.completed).length, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low' && !t.completed).length, color: '#10b981' },
  ];
  
  // Category distribution
  const categoryData = [
    { name: 'Assignments', count: tasks.filter(t => t.category === 'assignment' && !t.completed).length, color: '#6366f1' },
    { name: 'Exams', count: tasks.filter(t => t.category === 'exam' && !t.completed).length, color: '#ef4444' },
    { name: 'Reading', count: tasks.filter(t => t.category === 'reading' && !t.completed).length, color: '#10b981' },
    { name: 'Meetings', count: tasks.filter(t => t.category === 'meeting' && !t.completed).length, color: '#f59e0b' },
    { name: 'Other', count: tasks.filter(t => (!t.category || t.category === 'other') && !t.completed).length, color: '#8b5cf6' },
  ];
  
  // Weekly progress (last 7 days)
  const weeklyProgress = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    weeklyProgress.push({
      day: date.toLocaleString('default', { weekday: 'short' }),
      completed: dayTasks.filter(t => t.completed).length,
      pending: dayTasks.filter(t => !t.completed).length,
    });
  }
  
  // Monthly XP earned
  const monthlyXP = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const monthTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
    });
    const xpEarned = monthTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.xpReward || 0), 0);
    monthlyXP.push({ month: monthName, xp: xpEarned });
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Completion Rate Card */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm">Completion Rate</p>
              <p className="text-4xl font-bold mt-2">{completionRate}%</p>
              <p className="text-sm mt-2">{completedTasks}/{totalTasks} tasks done</p>
            </div>
            <i className="fas fa-chart-line text-3xl text-white/50"></i>
          </div>
        </div>
        
        {/* XP Stats Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm">Total XP Earned</p>
              <p className="text-4xl font-bold mt-2">
                {tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.xpReward || 0), 0)}
              </p>
              <p className="text-sm mt-2">Keep going!</p>
            </div>
            <i className="fas fa-star text-3xl text-white/50"></i>
          </div>
        </div>
        
        {/* Productivity Score Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm">Productivity Score</p>
              <p className="text-4xl font-bold mt-2">
                {Math.floor(completionRate * 0.8 + (tasks.length > 0 ? 20 : 0))}
              </p>
              <p className="text-sm mt-2">Excellent progress!</p>
            </div>
            <i className="fas fa-trophy text-3xl text-white/50"></i>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Priority Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-600"></i>
            Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category Distribution Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-bar text-indigo-600"></i>
            Tasks by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Progress Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-line text-indigo-600"></i>
            Weekly Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Monthly XP Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-line text-purple-600"></i>
            Monthly XP Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyXP}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="xp" stroke="#8b5cf6" name="XP Earned" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tips based on performance */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-3">
          <i className="fas fa-lightbulb text-2xl"></i>
          <div>
            <h3 className="font-bold text-lg mb-1">AI Study Tips</h3>
            <p className="text-sm">
              {completionRate < 30 ? "Start with small tasks to build momentum! 🚀" :
               completionRate < 70 ? "Great progress! Focus on high-priority tasks first. 💪" :
               "Excellent work! You're very organized. Keep maintaining this momentum! 🎉"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}