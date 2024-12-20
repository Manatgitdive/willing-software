import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import ShareWill from './ShareWill';
import emailjs from '@emailjs/browser';
import {
  Eye,
  Edit2,
  Trash2,
  Upload,
  Calendar,
  Clock,
  FileText,
  Share2,
  Plus,
  Users,
  AlertCircle,
  X,
  Download,
  Video,
  Image as ImageIcon,
  LogOut,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';

// Constants
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_rz8i1qa',
  TEMPLATE_ID: 'template_ku8n71h',
  APPROVAL_TEMPLATE_ID: 'template_approval',
  PUBLIC_KEY: 'hqe1Btv4SckDLaSAf'
};

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
const SUPPORTED_DOC_FORMATS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Component definition
const Dashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showWillBox, setShowWillBox] = useState(() => {
    return localStorage.getItem('willCreated') === 'true';
  });

  // Initialize emailjs
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadFiles();
      loadPendingApprovals();
    }
  }, [user]);

  // Add Calendly script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const calendlyScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (calendlyScript) {
        document.body.removeChild(calendlyScript);
      }
    };
  }, []);

  const handleScheduleMeeting = () => {
    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/manat-brainquest/30min'
      });
    } else {
      setError('Calendly is not loaded yet. Please try again in a moment.');
    }
  };




  

  // Load pending approvals
  const loadPendingApprovals = () => {
    try {
      const keys = Object.keys(localStorage);
      const pendingRequests = [];
  
      keys.forEach(key => {
        if (key.startsWith('share_request_')) {
          const requestData = JSON.parse(localStorage.getItem(key));
          
          if (requestData.status === 'pending' && 
              requestData.owner_email === localStorage.getItem('userEmail')) {
            pendingRequests.push(requestData);
          }
        }
      });
  
      pendingRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPendingApprovals(pendingRequests);
    } catch (error) {
      console.error('Error loading approvals:', error);
      setError('Error loading approval requests');
    }
  };







  // Load user files
  const loadFiles = async () => {
    try {
      const { data: filesList, error: filesError } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;

      const filesWithUrls = await Promise.all(
        filesList.map(async (file) => {
          const { data } = await supabase
            .storage
            .from('user-files')
            .createSignedUrl(`${user.id}/${file.filename}`, 3600);

          return {
            ...file,
            url: data?.signedUrl
          };
        })
      );

      setUploadedFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Error loading files');
    }
  };

  // Handle approval/rejection
  const handleApproval = async (requestId, approved) => {
    try {
      const requestKey = `share_request_${requestId}`;
      const requestData = localStorage.getItem(requestKey);
      
      if (!requestData) {
        throw new Error('Request not found');
      }
  
      const request = JSON.parse(requestData);
      request.status = approved ? 'approved' : 'rejected';
      request.updated_at = new Date().toISOString();
      
      localStorage.setItem(requestKey, JSON.stringify(request));
  
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.APPROVAL_TEMPLATE_ID,
        {
          to_email: request.requester_email,
          to_name: request.requester_name,
          pdf_link: request.file_url,
          access_password: request.password,
          status: request.status,
          sender_email: user.email,
          document_name: request.file_name
        }
      );
  
      loadPendingApprovals();
      setSuccess(`Access request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Approval error:', error);
      setError(`Failed to ${approved ? 'approve' : 'reject'} request`);
    }
  };

  // Handle file upload
  const handleFileChange = async (event) => {
    if (!user?.id) {
      setError('Please log in to upload files');
      return;
    }

    const files = Array.from(event.target.files);
    setError('');
    setUploadProgress(0);

    for (const file of files) {
      try {
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name} exceeds 30MB limit`);
          continue;
        }

        const isValidFormat = [...SUPPORTED_VIDEO_FORMATS, ...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_DOC_FORMATS]
          .includes(file.type);

        if (!isValidFormat) {
          setError(`${file.name} has unsupported format`);
          continue;
        }

        const timestamp = new Date().getTime();
        const filename = `${timestamp}-${file.name}`;
        const filePath = `${user.id}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              setUploadProgress(Math.round(percent));
            },
          });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('user_files')
          .insert({
            user_id: user.id,
            filename: filename,
            original_name: file.name,
            file_type: file.type,
            file_size: file.size,
            path: filePath
          });

        if (dbError) throw dbError;

        await loadFiles();
        setSuccess('File uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        setError(`Error uploading ${file.name}`);
      }
    }

    setUploadProgress(0);
    setShowUploadModal(false);
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId) => {
    if (!user?.id || !window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const fileToDelete = uploadedFiles.find(f => f.id === fileId);
      if (!fileToDelete) return;

      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([`${user.id}/${fileToDelete.filename}`]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      setSuccess('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting file');
    }
  };

  // Handle file download
  const handleDownload = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(`${user.id}/${file.filename}`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError(`Error downloading ${file.original_name}`);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('willCreated');
      setShowWillBox(false);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Error signing out');
    }
  };

  // Handle will creation
  const handleCreateWill = () => {
    setShowWillBox(true);
    localStorage.setItem('willCreated', 'true');
    navigate('/form');
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Upload Modal Component
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Files</h2>
          <button 
            onClick={() => setShowUploadModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept={[...SUPPORTED_VIDEO_FORMATS, ...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_DOC_FORMATS].join(',')}
            className="hidden"
            id="fileInput"
            multiple
          />
          <label 
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-blue-500 mb-2" />
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-1">
              Supported files: Video, Images, PDF, DOC, DOCX (max 30MB)
            </p>
          </label>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-2">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Approvals Modal Component
  const ApprovalsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Pending Access Requests</h2>
          <button 
            onClick={() => setShowApprovalsModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
  
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending access requests
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map(request => (
              <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{request.requester_name}</p>
                    <p className="text-sm text-gray-600">{request.requester_email}</p>
                    <p className="text-sm text-gray-600">
                      Document: {request.file_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Requested: {new Date(request.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {request.relationship}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(request.id, true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(request.id, false)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
            {success}
          </div>
        )}
      </div>
    </div>
  );

  // Document Preview Component
  const DocumentPreview = () => {
    if (uploadedFiles.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
          <p className="text-gray-600">No files uploaded yet</p>
        </div>
      );
    }

    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploadedFiles.map(file => (
          <div key={file.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {file.file_type.startsWith('video/') ? (
                  <Video className="w-5 h-5 text-blue-500 mr-2" />
                ) : file.file_type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-blue-500 mr-2" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-500 mr-2" />
                )}
                <span className="font-medium truncate" title={file.original_name}>
                  {file.original_name}
                </span>
              </div>
              <button
                onClick={() => handleDeleteFile(file.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-500 mb-2">
              Size: {formatFileSize(file.file_size)}
            </div>

            {file.file_type.startsWith('video/') ? (
              <video 
                controls 
                className="w-full h-32 object-cover rounded my-2"
                src={file.url}
              >
                Your browser does not support the video tag.
              </video>
            ) : file.file_type.startsWith('image/') && (
              <img 
                src={file.url}
                alt={file.original_name}
                className="w-full h-32 object-cover rounded my-2"
              />
            )}

            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleDownload(file)}
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main Dashboard Return
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Wills Dashboard</h1>
          <p className="text-gray-600">Manage and organize your legal documents</p>
          {user && (
            <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowApprovalsModal(true)}
            className="relative flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Bell className="w-5 h-5" />
            Approvals
            {pendingApprovals.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          {!showWillBox && (
            <button
              onClick={handleCreateWill}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create New Will
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Will Box */}
      {showWillBox && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Will</h3>
                <p className="text-sm text-gray-500">Created: {new Date().toLocaleDateString()}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Draft
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>

              <button
                onClick={() => { window.location.href="/form" }}
                className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button
                onClick={handleScheduleMeeting}
                className="flex items-center gap-1 px-3 py-1.5 text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>

              <ShareWill />
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no will is created */}
      {!showWillBox && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Click "Create New Will" to get started</p>
        </div>
      )}

      {/* File Upload Section */}
      {showWillBox && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <DocumentPreview />
        </div>
      )}

      {/* Modals */}
      {showUploadModal && <UploadModal />}
      {showApprovalsModal && <ApprovalsModal />}

      {/* Global Notifications */}
      {error && !showUploadModal && !showApprovalsModal && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      
      {success && !showUploadModal && !showApprovalsModal && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow-lg">
          {success}
        </div>
      )}
    </div>
  );
};

export default Dashboard;