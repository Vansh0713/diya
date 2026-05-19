import React, { useState, useEffect, useRef } from 'react';
import { sendOTP, verifyOTP, setupRecaptcha } from '../firebase/config';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function PhoneVerification({ userData, onVerificationComplete, onBack }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const recaptchaRef = useRef(null);

  // Setup reCAPTCHA when component mounts
  useEffect(() => {
    // Create a div for reCAPTCHA if it doesn't exist
    if (!document.getElementById('recaptcha-container')) {
      const recaptchaDiv = document.createElement('div');
      recaptchaDiv.id = 'recaptcha-container';
      document.body.appendChild(recaptchaDiv);
    }
    
    // Initialize reCAPTCHA
    try {
      setupRecaptcha('recaptcha-container');
    } catch (error) {
      console.log("reCAPTCHA already initialized");
    }
    
    // Cleanup
    return () => {
      // Optional: Clean up reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Ensure reCAPTCHA is set up
      if (!window.recaptchaVerifier) {
        setupRecaptcha('recaptcha-container');
      }
      
      const result = await sendOTP(phoneNumber, 'recaptcha-container');
      
      if (result.success) {
        setStep('otp');
        setTimer(60);
        setCanResend(false);
        setSuccess('OTP sent successfully! Please check your phone.');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error(err);
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    const result = await verifyOTP(otpCode);
    
    if (result.success) {
      setSuccess('Phone number verified successfully!');
      setTimeout(() => {
        onVerificationComplete(phoneNumber);
      }, 1500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Reset reCAPTCHA before resending
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setupRecaptcha('recaptcha-container');
      
      const result = await sendOTP(phoneNumber, 'recaptcha-container');
      
      if (result.success) {
        setTimer(60);
        setCanResend(false);
        setSuccess('OTP resent successfully!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
              <i className="fas fa-mobile-alt text-white text-3xl"></i>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Phone
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'phone' 
              ? 'Enter your phone number to receive OTP' 
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>

        {/* reCAPTCHA container - hidden but required */}
        <div id="recaptcha-container" className="invisible h-0"></div>

        {step === 'phone' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <PhoneInput
                international
                defaultCountry="IN"
                value={phoneNumber}
                onChange={setPhoneNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
              <p className="text-xs text-gray-500 mt-2">
                Include country code (e.g., +91 for India)
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                <i className="fas fa-check-circle mr-1"></i>
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Sending OTP...</>
                ) : (
                  <><i className="fas fa-paper-plane mr-2"></i> Send OTP</>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-indigo-600 hover:text-indigo-500"
            >
              <i className="fas fa-arrow-left mr-1"></i> Back to Sign Up
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="------"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit verification code sent to {phoneNumber}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                <i className="fas fa-check-circle mr-1"></i>
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Verifying...</>
                ) : (
                  <><i className="fas fa-check-circle mr-2"></i> Verify OTP</>
                )}
              </button>
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  <i className="fas fa-clock mr-1"></i>
                  Resend code in <span className="font-bold text-indigo-600">{timer}</span> seconds
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                  className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  <i className="fas fa-redo-alt mr-1"></i> Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtpCode('');
                setError('');
                setSuccess('');
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              <i className="fas fa-edit mr-1"></i> Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}