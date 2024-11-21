import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EditWillForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [willData, setWillData] = useState(null);

  // Fetch will data on component mount
  useEffect(() => {
    const fetchWillData = async () => {
      try {
        setIsLoading(true);
        // Get will ID from URL params or state
        const willId = new URLSearchParams(location.search).get('id');
        
        if (!willId) {
          throw new Error('No will ID provided');
        }

        // Get will data from localStorage
        const savedWills = JSON.parse(localStorage.getItem('savedWills') || '[]');
        const willToEdit = savedWills.find(will => will.id === willId);

        if (!willToEdit) {
          throw new Error('Will not found');
        }

        setWillData(willToEdit.formData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWillData();
  }, [location]);

  const handleSave = async (updatedData) => {
    try {
      const willId = new URLSearchParams(location.search).get('id');
      const savedWills = JSON.parse(localStorage.getItem('savedWills') || '[]');
      
      const updatedWills = savedWills.map(will => 
        will.id === willId 
          ? {
              ...will,
              formData: updatedData,
              lastModified: new Date().toISOString()
            }
          : will
      );

      localStorage.setItem('savedWills', JSON.stringify(updatedWills));
      navigate('/dashboard', { 
        state: { message: 'Will updated successfully!' }
      });
    } catch (error) {
      console.error('Error saving will:', error);
      setError('Failed to save changes. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Render the WillGenerator component with the existing data
  return (
    <WillGenerator
      initialData={willData}
      isEditMode={true}
      onSave={handleSave}
    />
  );
};

export default EditWillForm;