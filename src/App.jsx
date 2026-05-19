import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import Login from './components/Login';
import SignUp from './components/SignUp';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if email is verified
        if (user.emailVerified) {
          setUser(user);
        } else {
          // If not verified, sign out and show message
          auth.signOut();
          alert('Please verify your email before logging in. Check your inbox!');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    setShowSignUp(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showSignUp ? (
      <SignUp 
        onSignUp={(user) => {
          if (user) {
            alert('Account created! Please check your email to verify your account.');
            setShowSignUp(false);
          }
        }}
        onBackToLogin={() => setShowSignUp(false)}
      />
    ) : (
      <Login 
        onLogin={handleLogin}
        onShowSignUp={() => setShowSignUp(true)}
      />
    );
  }

  return (
    <AuthenticatedApp user={user} onLogout={handleLogout} />
  );
}

function AuthenticatedApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Student Academic Planner
                </h1>
                <p className="text-xs text-gray-500">
                  Welcome, {user.displayName || user.email?.split('@')[0]}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'dashboard' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className="fas fa-chart-line"></i>
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'tasks' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className="fas fa-tasks"></i>
                  <span className="hidden sm:inline">Task Manager</span>
                </button>
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:inline ml-2">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? <Dashboard user={user} /> : <TaskManager user={user} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2026 Student Academic Planner | Stay organized, track progress, and achieve your goals</p>
            <div className="flex justify-center space-x-4 mt-2">
              <i className="fas fa-envelope text-green-500"></i>
              <i className="fas fa-check-circle text-blue-500"></i>
              <i className="fas fa-shield-alt text-purple-500"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;