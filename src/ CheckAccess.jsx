// src/CheckAccess.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CheckAccess = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAccessStatus();
  }, [requestId]);

  const checkAccessStatus = () => {
    try {
      const requests = JSON.parse(localStorage.getItem('approvalRequests') || '[]');
      const request = requests.find(r => r.id === requestId);

      if (!request) {
        setStatus('error');
        setMessage('Request not found or has expired.');
        return;
      }

      switch (request.status) {
        case 'approved':
          setStatus('approved');
          setMessage('Access approved. You will be redirected to the document.');
          setTimeout(() => {
            window.location.href = request.file_url;
          }, 2000);
          break;
        
        case 'rejected':
          setStatus('rejected');
          setMessage('Your access request has been denied. Please contact the document owner.');
          break;
        
        case 'pending':
          setStatus('pending');
          setMessage('Your request is pending approval. You will receive an email once approved.');
          break;
        
        default:
          setStatus('error');
          setMessage('Invalid request status.');
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setError('Error checking access status');
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Document Access</h2>
        
        {status === 'checking' ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Checking access status...</p>
          </div>
        ) : (
          <div className={`p-4 rounded-lg ${getStatusStyles()}`}>
            <p className="text-center">{message}</p>
            {status === 'pending' && (
              <ul className="mt-4 text-sm space-y-2">
                <li>• Your request is being reviewed</li>
                <li>• You will receive an email notification once approved</li>
                <li>• The document owner will process your request shortly</li>
              </ul>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckAccess;