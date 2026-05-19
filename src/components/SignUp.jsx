import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUp({ onSignUp, onBackToLogin }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Timer for resend button
  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && verificationSent) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, verificationSent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.displayName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.displayName
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Save user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        displayName: formData.displayName,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        accountType: 'student'
      });
      
      setVerificationEmail(formData.email);
      setVerificationSent(true);
      setTimer(60); // 60 seconds cooldown for resend
      setCanResend(false);
      
    } catch (error) {
      let errorMessage = "";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Email already in use. Please use a different email or login.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address format.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Use at least 6 characters.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Contact support.";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      // Get current user
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setTimer(60);
        setCanResend(false);
        setError('Verification email resent! Please check your inbox.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again later.');
    }
    setLoading(false);
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-full">
                <i className="fas fa-envelope text-white text-3xl"></i>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                We've sent a verification email to:
              </p>
              <p className="font-bold text-indigo-600 mt-1 text-lg">
                {verificationEmail}
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-700">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Please check your inbox and click the verification link to activate your account.
                </p>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Didn't receive the email? Check your spam folder or click resend below.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={!canResend || loading}
              className="w-full flex justify-center py-2 px-4 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Sending...</>
              ) : (
                <>
                  <i className="fas fa-redo-alt mr-2"></i>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Verification Email'}
                </>
              )}
            </button>
            
            <button
              onClick={() => onSignUp(null)}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Go to Login
            </button>
            
            <button
              onClick={() => {
                setVerificationSent(false);
                setFormData({ displayName: '', email: '', password: '', confirmPassword: '' });
                setResendCount(0);
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              <i className="fas fa-user-plus mr-1"></i>
              Create another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
              <i className="fas fa-graduation-cap text-white text-3xl"></i>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Student Planner with email verification
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="displayName"
                required
                value={formData.displayName}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="student@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll need to verify this email
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Creating Account...</>
              ) : (
                <><i className="fas fa-user-plus mr-2"></i> Sign Up</>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}