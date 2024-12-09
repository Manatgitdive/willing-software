// src/ValidateAccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ValidateAccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = () => {
    const requestId = searchParams.get('request');
    
    if (!requestId) {
      setStatus('error');
      setMessage('Invalid access link');
      return;
    }

    // Get requests from localStorage
    const requests = JSON.parse(localStorage.getItem('approvalRequests') || '[]');
    const request = requests.find(r => r.id === requestId);

    if (!request) {
      setStatus('error');
      setMessage('Request not found or has expired');
      return;
    }

    switch (request.status) {
      case 'approved':
        setStatus('approved');
        setMessage('Access approved! Redirecting to document...');
        setTimeout(() => {
          window.location.href = request.file_url;
        }, 2000);
        break;
      case 'rejected':
        setStatus('error');
        setMessage('Access denied. Please contact the document owner.');
        break;
      case 'pending':
        setStatus('pending');
        setMessage('Your access request is pending approval. You will receive an email once approved.');
        break;
      default:
        setStatus('error');
        setMessage('Invalid request status');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Document Access</h2>
        <div className={`p-4 rounded-lg ${
          status === 'approved' ? 'bg-green-50 text-green-700' :
          status === 'error' ? 'bg-red-50 text-red-700' :
          'bg-yellow-50 text-yellow-700'
        }`}>
          {message}
        </div>
      </div>
    </div>
  );
};

export default ValidateAccess;