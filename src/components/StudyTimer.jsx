import React, { useState, useEffect } from 'react';
import { addStudyTime } from '../hooks/useTasks';

export default function StudyTimer({ user, onStudyTimeUpdate }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('study'); // study, break
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (sessionType === 'study') {
      // Award XP for completed study session
      const earnedXP = Math.floor(25 / 10);
      addStudyTime(user.uid, 25);
      onStudyTimeUpdate(25);
      
      // Show notification
      new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
      alert(`🎉 Great job! You completed a ${minutes} minute study session!\nEarned ${earnedXP} XP!`);
      
      setSessionsCompleted(prev => prev + 1);
      setSessionType('break');
      setMinutes(5);
      setSeconds(0);
      setIsActive(true);
    } else {
      // Break completed
      alert('☕ Break completed! Ready for another study session?');
      setSessionType('study');
      setMinutes(25);
      setSeconds(0);
    }
  };

  const startTimer = () => {
    if (minutes === 0 && seconds === 0) {
      setMinutes(25);
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setSessionType('study');
  };

  const setCustomTimer = () => {
    setMinutes(customMinutes);
    setSeconds(0);
    setSessionType('study');
    setShowCustomModal(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <i className="fas fa-hourglass-half text-indigo-600"></i>
          Pomodoro Timer
        </h3>
        
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            sessionType === 'study' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {sessionType === 'study' ? '📚 Study Session' : '☕ Break Time'}
          </span>
        </div>

        <div className="text-6xl font-bold text-gray-800 mb-6 font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="flex gap-3 justify-center mb-6">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              <i className="fas fa-play mr-2"></i> Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              <i className="fas fa-pause mr-2"></i> Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            <i className="fas fa-redo mr-2"></i> Reset
          </button>
          <button
            onClick={() => setShowCustomModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            <i className="fas fa-cog mr-2"></i> Custom
          </button>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            <i className="fas fa-trophy text-yellow-500 mr-2"></i>
            Sessions Completed: <span className="font-bold">{sessionsCompleted}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Study for 25 minutes, then take a 5-minute break
          </p>
        </div>
      </div>

      {/* Custom Timer Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Custom Study Time</h3>
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              min="1"
              max="120"
            />
            <div className="flex gap-3">
              <button
                onClick={setCustomTimer}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
              >
                Set Timer
              </button>
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}