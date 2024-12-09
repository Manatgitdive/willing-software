import React, { useState, useEffect } from 'react';
import { Share2, Lock, Mail, Clock, CheckCircle, Upload, AlertCircle, X, Trash2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
  
const EMAILJS_SERVICE_ID = 'service_s8qmko3';
const EMAILJS_TEMPLATE_ID = 'template_ibd242i';
const EMAILJS_PUBLIC_KEY = '2UzhaCo_sNXTplzST';
const API_URL = 'http://localhost:8080';

export default function ShareWill() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [sendingProgress, setSendingProgress] = useState({
    current: 0,
    total: 0,
    sent: []
  });

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  useEffect(() => {
    if (showModal) {
      loadBeneficiaries();
    }
  }, [showModal]);

  const loadBeneficiaries = () => {
    try {
      const userEmail = localStorage.getItem('userEmail') || 'guest';
      const formKey = `willForm_${userEmail}`;
      const willData = JSON.parse(localStorage.getItem(formKey) || '{}');
      
      const children = Array.isArray(willData.children) ? willData.children : [];
      const additional = Array.isArray(willData.additionalBeneficiaries) 
        ? willData.additionalBeneficiaries 
        : [];

      const processed = [];
      
      children.forEach(child => {
        if (child.email && child.email.includes('@')) {
          processed.push({
            email: child.email.trim().toLowerCase(),
            fullName: child.fullName || child.name || '',
            type: 'Child',
            relationship: child.relationship || 'Child',
            password: Math.random().toString(36).slice(-8)
          });
        }
      });

      additional.forEach(ben => {
        if (ben.email && ben.email.includes('@')) {
          processed.push({
            email: ben.email.trim().toLowerCase(),
            fullName: ben.fullName || ben.name || '',
            type: ben.type || 'Individual',
            relationship: ben.relationship || 'Beneficiary',
            password: Math.random().toString(36).slice(-8)
          });
        }
      });

      const uniqueBeneficiaries = processed.reduce((acc, current) => {
        const exists = acc.find(item => item.email === current.email);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setBeneficiaries(uniqueBeneficiaries);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
      setError('Error loading beneficiaries');
    }
  };

  const uploadToS3 = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `https://e6a2-119-82-104-186.ngrok-free.app/upload-document`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file to storage');
    }
  };

  const createApprovalRequest = async (beneficiary, uploadResponse) => {
    try {
      const requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
      const request = {
        id: requestId,
        created_at: new Date().toISOString(),
        requester_email: beneficiary.email,
        requester_name: beneficiary.fullName,
        file_url: uploadResponse.cloudFrontUrl,
        file_name: selectedFile.name,
        status: 'pending',
        relationship: beneficiary.relationship,
        type: beneficiary.type,
        password: beneficiary.password,
        owner_email: localStorage.getItem('userEmail')
      };

      const approvalRequests = JSON.parse(localStorage.getItem('approvalRequests') || '[]');
      approvalRequests.push(request);
      localStorage.setItem('approvalRequests', JSON.stringify(approvalRequests));

      return request;
    } catch (error) {
      console.error('Error creating approval request:', error);
      throw error;
    }
  };















  const sendEmailToBeneficiary = async (beneficiary, uploadResponse) => {
    try {
      console.log(`Sending email to ${beneficiary.email}`);
      
      // Generate a token/ID for this share
      const shareId = `share_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store share information without creating approval request
      const shareInfo = {
        id: shareId,
        created_at: new Date().toISOString(),
        requester_email: beneficiary.email,
        requester_name: beneficiary.fullName,
        file_url: uploadResponse.cloudFrontUrl,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        relationship: beneficiary.relationship,
        password: beneficiary.password,
        owner_email: localStorage.getItem('userEmail'),
        status: 'shared' // Initial status before request
      };
  
      // Store share info in localStorage
      const shares = JSON.parse(localStorage.getItem('shareInfo') || '[]');
      shares.push(shareInfo);
      localStorage.setItem('shareInfo', JSON.stringify(shares));
  
      // Create access URL that will trigger approval request when clicked
      const accessUrl = `${window.location.origin}/validate-access?share=${shareId}`;
      
      const emailParams = {
        enduser_email: beneficiary.email,
        to_email: beneficiary.email,
        to_name: beneficiary.fullName,
        pdf_link: accessUrl,
        access_password: beneficiary.password,
        relationship: beneficiary.relationship,
        type: beneficiary.type,
        sender_email: localStorage.getItem('userEmail'),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };
  
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams
      );
  
      console.log('Email sent successfully:', result);
      return { success: true, email: beneficiary.email };
    } catch (error) {
      console.error(`Failed to send email to ${beneficiary.email}:`, error);
      return { success: false, email: beneficiary.email, error };
    }
  };






  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setSelectedFile(null);
    }
  };

  const handleRemoveBeneficiary = (emailToRemove) => {
    setBeneficiaries(prev => prev.filter(ben => ben.email !== emailToRemove));
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!selectedFile) {
        throw new Error('Please upload your will document');
      }

      if (beneficiaries.length === 0) {
        throw new Error('No beneficiaries with email addresses found');
      }

      setSendingProgress({
        current: 0,
        total: beneficiaries.length,
        sent: []
      });

      const uploadResponse = await uploadToS3(selectedFile);
      console.log('Upload successful:', uploadResponse);

      const results = [];

      for (let i = 0; i < beneficiaries.length; i++) {
        const beneficiary = beneficiaries[i];
        
        setSendingProgress(prev => ({
          ...prev,
          current: i + 1,
          sent: [...prev.sent, { email: beneficiary.email, status: 'sending' }]
        }));

        const result = await sendEmailToBeneficiary(beneficiary, uploadResponse);
        results.push(result);

        setSendingProgress(prev => ({
          ...prev,
          sent: prev.sent.map(item =>
            item.email === beneficiary.email
              ? { ...item, status: result.success ? 'success' : 'failed' }
              : item
          )
        }));

        if (i < beneficiaries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length === beneficiaries.length) {
        setSuccess('Approval requests created and notifications sent to all beneficiaries!');
        setShowModal(false);
        setSelectedFile(null);
      } else if (successful.length > 0) {
        setSuccess(`Successfully sent to: ${successful.map(r => r.email).join(', ')}`);
        if (failed.length > 0) {
          setError(`Failed to send to: ${failed.map(r => r.email).join(', ')}`);
        }
      } else {
        setError('Failed to send the will to any beneficiaries. Please try again.');
      }
    } catch (err) {
      console.error('Share error:', err);
      setError(err.message || 'Failed to share will');
    } finally {
      setLoading(false);
    }
  };

  // Return your existing JSX unchanged
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Share Your Will</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Will Document (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-500">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                Beneficiaries ({beneficiaries.length})
              </h3>
              {beneficiaries.length === 0 ? (
                <p className="text-gray-500">No beneficiaries with email addresses found.</p>
              ) : (
                <div className="space-y-4">
                  {beneficiaries.map((ben, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{ben.fullName}</p>
                          <p className="text-sm text-gray-600">{ben.email}</p>
                          <p className="text-sm text-gray-600">{ben.type} - {ben.relationship}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500">
                            Access Password: {ben.password}
                          </div>
                          <button
                            onClick={() => handleRemoveBeneficiary(ben.email)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove beneficiary"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {sendingProgress.sent.find(item => item.email === ben.email) && (
                        <div className={`mt-2 text-sm ${
                          sendingProgress.sent.find(item => item.email === ben.email)?.status === 'success'
                            ? 'text-green-600'
                            : sendingProgress.sent.find(item => item.email === ben.email)?.status === 'failed'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {sendingProgress.sent.find(item => item.email === ben.email)?.status === 'success'
                            ? '✓ Approval request created'
                            : sendingProgress.sent.find(item => item.email === ben.email)?.status === 'failed'
                            ? '× Failed to create request'
                            : '• Creating request...'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Important Notes:</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Each beneficiary will receive their unique password
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email notifications will be sent automatically
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Links expire after 30 days
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Your approval required before access is granted
                </li>
              </ul>
            </div>

            {loading && sendingProgress.total > 0 && (
              <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                Creating requests: {sendingProgress.current} of {sendingProgress.total} beneficiaries...
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={loading || !selectedFile || beneficiaries.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading 
                  ? `Sharing (${sendingProgress.current}/${sendingProgress.total})...` 
                  : 'Share Will'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}