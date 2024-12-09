// src/ValidateAccess.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, Lock } from 'lucide-react';

const ValidateAccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    handleAccess();
  }, []);

  const handleAccess = () => {
    const shareId = searchParams.get('share');
    
    if (!shareId) {
      setStatus('error');
      setMessage('Invalid access link');
      return;
    }

    // Get share info
    const shares = JSON.parse(localStorage.getItem('shareInfo') || '[]');
    const shareInfo = shares.find(s => s.id === shareId);

    if (!shareInfo) {
      setStatus('error');
      setMessage('Share not found or has expired');
      return;
    }

    setDocumentInfo(shareInfo);

    // Check if approval request already exists
    const existingRequests = JSON.parse(localStorage.getItem('approvalRequests') || '[]');
    const existingRequest = existingRequests.find(
      r => r.requester_email === shareInfo.requester_email && 
           r.file_url === shareInfo.file_url
    );

    if (existingRequest) {
      // Show status based on existing request
      switch (existingRequest.status) {
        case 'approved':
          setStatus('approved');
          setMessage('Access approved! Please enter your password.');
          setShowPasswordInput(true);
          setDocumentInfo(existingRequest);
          break;
        case 'rejected':
          setStatus('rejected');
          setMessage('Your access request has been denied. Please contact the document owner.');
          break;
        case 'pending':
          setStatus('pending');
          setMessage('Your access request is pending approval. You will receive an email once approved.');
          break;
        default:
          setStatus('error');
          setMessage('Invalid request status');
      }
    } else {
      // Create new approval request
      const requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
      const newRequest = {
        ...shareInfo,
        id: requestId,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      existingRequests.push(newRequest);
      localStorage.setItem('approvalRequests', JSON.stringify(existingRequests));

      setStatus('pending');
      setMessage('Your access request has been created and is pending approval.');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!documentInfo) {
      setError('Document information not found');
      return;
    }

    if (password === documentInfo.password) {
      // Correct password - show success message and redirect
      setMessage('Password correct! Redirecting to document...');
      setTimeout(() => {
        window.location.href = documentInfo.file_url;
      }, 1500);
    } else {
      // Wrong password
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'pending':
        return <Clock className="w-12 h-12 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderContent = () => {
    if (status === 'checking') {
      return (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      );
    }

    if (status === 'approved' && showPasswordInput) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-700">{message}</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password from email"
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Access Document
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-lg border ${getStatusClass()}`}>
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <p className="text-center">{message}</p>
        {status === 'pending' && (
          <ul className="mt-4 text-sm space-y-2">
            <li>• Your request will be reviewed by the document owner</li>
            <li>• You will receive an email notification once approved</li>
            <li>• You will need your password to access the document</li>
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Document Access</h2>
        
        {documentInfo && (
          <p className="text-center text-gray-600 mb-6">
            Document: {documentInfo.file_name}
          </p>
        )}

        {renderContent()}

        {/* Footer with contact info */}
        {documentInfo && status !== 'error' && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>
              Need help? Contact{' '}
              <a href={`mailto:${documentInfo.owner_email}`} className="text-blue-600 hover:text-blue-800">
                {documentInfo.owner_email}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidateAccess;