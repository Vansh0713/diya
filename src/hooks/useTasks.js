import { useState, useEffect, useCallback } from 'react';
import { auth, getTasksFromFirestore, saveTaskToFirestore, updateTaskInFirestore, deleteTaskFromFirestore } from '../firebase/config';

export const useTasks = (user) => {
  const [tasks, setTasks] = useState([]);
  const [xp, setXp] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load tasks from Firebase when user changes
  useEffect(() => {
    if (user) {
      loadTasks();
      loadUserStats();
    } else {
      setTasks([]);
      setXp(0);
      setStudyTime(0);
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    const result = await getTasksFromFirestore(user.uid);
    if (result.success) {
      setTasks(result.tasks);
      // Calculate XP from completed tasks
      const totalXP = result.tasks
        .filter(t => t.completed)
        .reduce((sum, task) => sum + (task.xpReward || 0), 0);
      setXp(totalXP);
    }
    setLoading(false);
  };

  const loadUserStats = () => {
    const savedStudyTime = localStorage.getItem(`study_time_${user.uid}`);
    if (savedStudyTime) {
      setStudyTime(parseInt(savedStudyTime));
    }
  };

  const addTask = useCallback(async (task) => {
    if (!user) return;
    const newTask = { ...task, completed: false };
    const result = await saveTaskToFirestore(user.uid, newTask);
    if (result.success) {
      await loadTasks();
    }
  }, [user]);

  const toggleTask = useCallback(async (taskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      };
      const result = await updateTaskInFirestore(taskId, updatedTask);
      if (result.success) {
        await loadTasks();
      }
    }
  }, [user, tasks]);

  const deleteTask = useCallback(async (taskId) => {
    if (!user) return;
    const result = await deleteTaskFromFirestore(taskId);
    if (result.success) {
      await loadTasks();
    }
  }, [user]);

  const editTask = useCallback(async (updatedTask) => {
    if (!user) return;
    const result = await updateTaskInFirestore(updatedTask.id, updatedTask);
    if (result.success) {
      await loadTasks();
    }
  }, [user]);

  const addStudyTime = useCallback((minutes) => {
    const newStudyTime = studyTime + minutes;
    setStudyTime(newStudyTime);
    localStorage.setItem(`study_time_${user.uid}`, newStudyTime);
    // Award XP for studying (1 XP per 10 minutes)
    const earnedXP = Math.floor(minutes / 10);
    if (earnedXP > 0) {
      setXp(prev => prev + earnedXP);
    }
  }, [studyTime, user]);

  const getAnalytics = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total === 0 ? 0 : (completed / total * 100).toFixed(1);
    
    const byPriority = {
      high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
      medium: tasks.filter(t => t.priority === 'medium' && !t.completed).length,
      low: tasks.filter(t => t.priority === 'low' && !t.completed).length,
    };
    
    const byCategory = {
      assignment: tasks.filter(t => t.category === 'assignment' && !t.completed).length,
      exam: tasks.filter(t => t.category === 'exam' && !t.completed).length,
      reading: tasks.filter(t => t.category === 'reading' && !t.completed).length,
      meeting: tasks.filter(t => t.category === 'meeting' && !t.completed).length,
      other: tasks.filter(t => (!t.category || t.category === 'other') && !t.completed).length,
    };
    
    return { total, completed, completionRate, byPriority, byCategory };
  }, [tasks]);

  return { 
    tasks, 
    xp, 
    studyTime,
    loading,
    addTask, 
    toggleTask, 
    deleteTask, 
    editTask,
    addStudyTime,
    getAnalytics 
  };
};