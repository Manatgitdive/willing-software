import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
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
  LogOut
} from 'lucide-react';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-mov',
  'video/mpeg',
  'video/x-msvideo',
  'video/x-matroska',
  'video/3gpp'
];

const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
const SUPPORTED_DOC_FORMATS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);

  const willsList = [
    {
      id: 1,
      name: "My Will",
      status: "Draft",
      created: new Date().toLocaleDateString()
    }
  ];

  // Check for Supabase session
  useEffect(() => {
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

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Load files when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadFiles();
    }
  }, [user]);

  // Calendly integration
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
      setError('Error signing out');
    }
  };

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

        if (!isValidFileType(file)) {
          setError(`${file.name} has unsupported format`);
          continue;
        }

        const timestamp = new Date().getTime();
        const filename = `${timestamp}-${file.name}`;
        const filePath = `${user.id}/${filename}`;

        // Upload to Supabase Storage
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

        // Create database record
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

        await loadFiles(); // Reload the files list
      } catch (error) {
        console.error('Upload error:', error);
        setError(`Error uploading ${file.name}`);
      }
    }

    setUploadProgress(0);
    setShowUploadModal(false);
  };

  const handleDeleteFile = async (fileId) => {
    if (!user?.id || !window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const fileToDelete = uploadedFiles.find(f => f.id === fileId);
      if (!fileToDelete) return;

      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([`${user.id}/${fileToDelete.filename}`]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting file');
    }
  };

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidFileType = (file) => {
    return [...SUPPORTED_VIDEO_FORMATS, ...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_DOC_FORMATS].includes(file.type);
  };

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/manat-brainquest/30min'
      });
    }
  };

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
              Uploaded: {new Date(file.created_at).toLocaleDateString()}
            </div>

            {file.file_type.startsWith('video/') ? (
              <div>
                <video 
                  controls 
                  className="w-full h-32 object-cover rounded my-2"
                  src={file.url}
                >
                  Your browser does not support the video tag.
                </video>
                <p className="text-sm text-gray-500">
                  Size: {formatFileSize(file.file_size)}
                </p>
              </div>
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
            onClick={() => window.open('https://app.pandadoc.com/a/#/dashboard', '_blank')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FileText className="w-5 h-5" />
            Share Will
          </button>

          <button
            onClick={() => { location.href="/form" }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create New Will
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {willsList.map((will) => (
          <div key={will.id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{will.name}</h3>
                <p className="text-sm text-gray-500">Created: {will.created}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                will.status === 'Final' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {will.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>

              <button
                onClick={() => { location.href="/form" }}
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
                onClick={openCalendly}
                className="flex items-center gap-1 px-3 py-1.5 text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>

              <button
                onClick={() => window.open('https://app.pandadoc.com/a/#/dashboard', '_blank')}
                className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
              >
                <FileText className="w-4 h-4" />
                <span>Share will</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
        <DocumentPreview />
      </div>

      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default Dashboard;