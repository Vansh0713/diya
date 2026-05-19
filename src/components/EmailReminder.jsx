import React, { useState, useEffect } from 'react';

// Your backend API URL (update with your server address)
const API_URL = 'http://localhost:5001/api';

export default function EmailReminder({ user, tasks }) {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem(`reminders_${user?.uid}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  // Test SMTP connection
  const testEmailConnection = async () => {
    setTestingEmail(true);
    try {
      const response = await fetch(`${API_URL}/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email }),
      });
      const data = await response.json();
      if (data.success) {
        setNotificationStatus('✅ Test email sent! Check your inbox.');
      } else {
        setNotificationStatus('❌ Failed to send test email: ' + data.error);
      }
    } catch (error) {
      setNotificationStatus('❌ Cannot connect to email server. Make sure the backend is running.');
    }
    setTimeout(() => setNotificationStatus(''), 5000);
    setTestingEmail(false);
  };

  // Check for due reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkDueReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, tasks]);

  const checkDueReminders = async () => {
    const now = new Date();
    for (const reminder of reminders) {
      const reminderDate = new Date(reminder.reminderTime);
      if (!reminder.sent && reminderDate <= now) {
        await sendReminderEmail(reminder);
      }
    }
  };

  const sendReminderEmail = async (reminder) => {
    const task = tasks.find(t => t.id === reminder.taskId);
    if (!task) return;

    try {
      const response = await fetch(`${API_URL}/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          toName: user.displayName || user.email.split('@')[0],
          taskTitle: task.title,
          taskSubject: task.subject,
          dueDate: task.dueDate,
          priority: task.priority,
          xpReward: task.xpReward,
          reminderMessage: reminder.message,
          dashboardUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const updatedReminders = reminders.map(r =>
          r.id === reminder.id ? { ...r, sent: true, sentAt: new Date().toISOString() } : r
        );
        setReminders(updatedReminders);
        localStorage.setItem(`reminders_${user?.uid}`, JSON.stringify(updatedReminders));
        setNotificationStatus(`📧 Reminder sent for "${task.title}"`);
      } else {
        console.error('Failed to send email:', data.error);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const scheduleReminder = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSending(true);
    
    const newReminder = {
      id: Date.now().toString(),
      taskId: selectedTask.id,
      reminderTime: reminderTime,
      message: reminderMessage,
      sent: false,
      createdAt: new Date().toISOString(),
    };

    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    localStorage.setItem(`reminders_${user?.uid}`, JSON.stringify(updatedReminders));

    setShowModal(false);
    setSelectedTask(null);
    setReminderTime('');
    setReminderMessage('');
    setSending(false);
    
    setNotificationStatus('⏰ Reminder scheduled successfully!');
    setTimeout(() => setNotificationStatus(''), 3000);
  };

  const deleteReminder = (reminderId) => {
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    setReminders(updatedReminders);
    localStorage.setItem(`reminders_${user?.uid}`, JSON.stringify(updatedReminders));
  };

  const getPendingTasksForReminder = () => {
    return tasks.filter(task => !task.completed);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fas fa-bell text-indigo-600"></i>
          Email Reminders
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">
            via Hostinger SMTP
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={testEmailConnection}
            disabled={testingEmail}
            className="text-sm text-gray-600 hover:text-indigo-600 px-3 py-1 rounded-lg border hover:border-indigo-600 transition"
          >
            <i className="fas fa-vial mr-1"></i>
            {testingEmail ? 'Testing...' : 'Test Email'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <i className="fas fa-plus mr-1"></i> New Reminder
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          notificationStatus.includes('✅') || notificationStatus.includes('📧') || notificationStatus.includes('⏰')
            ? 'bg-green-100 text-green-700'
            : notificationStatus.includes('❌') 
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          <i className={`mr-2 ${
            notificationStatus.includes('✅') || notificationStatus.includes('📧') || notificationStatus.includes('⏰')
              ? 'fas fa-check-circle'
              : notificationStatus.includes('❌')
              ? 'fas fa-exclamation-circle'
              : 'fas fa-info-circle'
          }`}></i>
          {notificationStatus}
        </div>
      )}

      {/* Info Box */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
        <i className="fas fa-envelope text-blue-500 mr-1"></i>
        Reminders will be sent from your Hostinger email: <strong>{user?.email}</strong>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-bell-slash text-4xl mb-2 block"></i>
          <p>No reminders scheduled</p>
          <p className="text-sm">Click "New Reminder" to get email notifications for your tasks</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {reminders.map(reminder => {
            const task = tasks.find(t => t.id === reminder.taskId);
            const reminderDate = new Date(reminder.reminderTime);
            const isPast = reminderDate <= new Date();
            
            return (
              <div key={reminder.id} className={`p-4 border rounded-lg ${reminder.sent ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{task?.title || 'Unknown Task'}</h4>
                      {reminder.sent ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          <i className="fas fa-check mr-1"></i>Sent
                        </span>
                      ) : isPast ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          <i className="fas fa-clock mr-1"></i>Pending
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          <i className="fas fa-hourglass-half mr-1"></i>Scheduled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{reminder.message}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span><i className="far fa-calendar mr-1"></i>{reminderDate.toLocaleDateString()}</span>
                      <span><i className="far fa-clock mr-1"></i>{reminderDate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {!reminder.sent && (
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                <i className="fas fa-bell text-indigo-600 mr-2"></i>
                Schedule Email Reminder
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={scheduleReminder}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Task
                  </label>
                  <select
                    required
                    value={selectedTask?.id || ''}
                    onChange={(e) => {
                      const task = tasks.find(t => t.id === e.target.value);
                      setSelectedTask(task);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Choose a task...</option>
                    {getPendingTasksForReminder().map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} - Due: {task.dueDate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Message
                  </label>
                  <textarea
                    required
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Don't forget to submit your assignment before the deadline!"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
                >
                  {sending ? 'Scheduling...' : 'Schedule Reminder'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
              <i className="fas fa-envelope text-blue-500 mr-1"></i>
              Emails will be sent via Hostinger SMTP from your domain email address.
              <br />
              <i className="fas fa-clock text-blue-500 mr-1 mt-1"></i>
              The email server will send reminders at the scheduled time. Keep the backend running!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}