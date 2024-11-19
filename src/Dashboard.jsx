import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const willsList = [
    {
      id: 1,
      name: "John Doe's Will",
      created: "15/10/2024",
      lastModified: "16/10/2024",
      documents: 2,
      status: "Final",
      nextReview: "15/10/2025",
      beneficiaries: 5,
      documentSize: "2.4 MB",
      shared: true
    },
    {
      id: 2,
      name: "Jane Smith's Will",
      created: "20/10/2024",
      lastModified: "21/10/2024",
      documents: 1,
      status: "Draft",
      nextReview: "20/10/2025",
      beneficiaries: 3,
      documentSize: "1.2 MB",
      shared: false
    },
    {
      id: 3,
      name: "Alice Johnson's Will",
      created: "25/10/2024",
      lastModified: "26/10/2024",
      documents: 3,
      status: "Final",
      nextReview: "25/10/2025",
      beneficiaries: 4,
      documentSize: "3.1 MB",
      shared: true
    }
  ];

  const handleCreateNew = () => {
    navigate('/create-will');
  };

  const handleView = (id) => {
    navigate(`/view-will/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/edit-will/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this will?')) {
      // Delete logic here
      console.log('Deleting will:', id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Wills Dashboard</h1>
          <p className="text-gray-600">Manage and organize your legal documents</p>
        </div>
        <button
          onClick={()=>{
            location.href="/form"
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Will
        </button>
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
                will.status === 'Final' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {will.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Documents: {will.documents}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Beneficiaries: {will.beneficiaries}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Next Review: {will.nextReview}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>{will.shared ? 'Shared' : 'Private'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <button
                onClick={() => handleView(will.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => handleEdit(will.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(will.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            </div>

            {will.status === 'Draft' && (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-md mt-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Complete your will draft</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;