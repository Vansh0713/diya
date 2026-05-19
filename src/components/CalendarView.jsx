import React, { useState } from 'react';

export default function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    
    const calendarDays = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>);
    }
    
    // Fill in actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateTasks = getTasksForDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = today.getDate() === day && 
                      today.getMonth() === currentDate.getMonth() && 
                      today.getFullYear() === currentDate.getFullYear();
      const hasHighPriority = dateTasks.some(t => t.priority === 'high' && !t.completed);
      
      calendarDays.push(
        <div
          key={day}
          onClick={() => setSelectedDate({ day, month: currentDate.getMonth(), year: currentDate.getFullYear(), tasks: dateTasks })}
          className={`h-24 p-2 border rounded-lg cursor-pointer hover:shadow-lg transition ${
            isToday ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200'
          } ${selectedDate?.day === day ? 'ring-2 ring-indigo-500' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
              {day}
            </span>
            {hasHighPriority && <i className="fas fa-exclamation-circle text-red-500 text-xs"></i>}
          </div>
          <div className="mt-1 space-y-1">
            {dateTasks.slice(0, 2).map(task => (
              <div key={task.id} className="text-xs truncate">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  task.priority === 'high' ? 'bg-red-500' : 
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-600'}>
                  {task.title}
                </span>
              </div>
            ))}
            {dateTasks.length > 2 && (
              <div className="text-xs text-gray-400">+{dateTasks.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return calendarDays;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fas fa-calendar-alt text-indigo-600"></i>
          Calendar View
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-700">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {renderCalendar()}
      </div>

      {/* Task Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Tasks for {selectedDate.month + 1}/{selectedDate.day}/{selectedDate.year}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            {selectedDate.tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks for this day</p>
            ) : (
              <div className="space-y-3">
                {selectedDate.tasks.map(task => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{task.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{task.subject}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        <i className="fas fa-star mr-1"></i>+{task.xpReward} XP
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.completed ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}