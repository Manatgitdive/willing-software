import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditWill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 20;

  useEffect(() => {
    const savedWills = JSON.parse(localStorage.getItem('savedWills') || '[]');
    const willToEdit = savedWills.find(will => will.id === id);
    
    if (willToEdit) {
      setFormData(willToEdit);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const handleInputChange = (e, section, field, index = null) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section && index !== null) {
        if (!Array.isArray(newData[section])) {
          newData[section] = [];
        }
        
        if (!newData[section][index]) {
          newData[section][index] = {};
        }
        
        newData[section][index] = {
          ...newData[section][index],
          [field]: value
        };
      } else if (section) {
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const handleSave = () => {
    const savedWills = JSON.parse(localStorage.getItem('savedWills') || '[]');
    const updatedWills = savedWills.map(will => 
      will.id === id ? { 
        ...formData, 
        lastModified: new Date().toISOString(),
        status: 'Draft'
      } : will
    );
    
    localStorage.setItem('savedWills', JSON.stringify(updatedWills));
    navigate('/dashboard');
  };

  const handleFinalize = async () => {
    try {
      const savedWills = JSON.parse(localStorage.getItem('savedWills') || '[]');
      const updatedWills = savedWills.map(will => 
        will.id === id ? { 
          ...formData, 
          lastModified: new Date().toISOString(),
          status: 'Final'
        } : will
      );
      
      localStorage.setItem('savedWills', JSON.stringify(updatedWills));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error finalizing will:', error);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prefix</label>
          <select
            value={formData?.prefix || ''}
            onChange={(e) => handleInputChange(e, null, 'prefix')}
            className="w-full p-2 border rounded"
          >
            <option value="">Select...</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
          </select>
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={formData?.testatorName || ''}
            onChange={(e) => handleInputChange(e, null, 'testatorName')}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Suffix</label>
          <select
            value={formData?.suffix || ''}
            onChange={(e) => handleInputChange(e, null, 'suffix')}
            className="w-full p-2 border rounded"
          >
            <option value="">Select...</option>
            <option value="Jr">Jr</option>
            <option value="Sr">Sr</option>
            <option value="II">II</option>
            <option value="III">III</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Occupation</label>
        <input
          type="text"
          value={formData?.occupation || ''}
          onChange={(e) => handleInputChange(e, null, 'occupation')}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          value={formData?.address || ''}
          onChange={(e) => handleInputChange(e, null, 'address')}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Parish</label>
        <input
          type="text"
          value={formData?.parish || ''}
          onChange={(e) => handleInputChange(e, null, 'parish')}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );

  const renderFamilyStatus = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Family Status</h3>
      <div>
        <label className="block text-sm font-medium mb-2">Marital Status</label>
        <select
          value={formData?.maritalStatus || ''}
          onChange={(e) => handleInputChange(e, null, 'maritalStatus')}
          className="w-full p-2 border rounded"
        >
          <option value="">Select...</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Living Children</label>
        <div className="space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              checked={formData?.livingChildren === 'yes'}
              onChange={(e) => handleInputChange(e, null, 'livingChildren')}
              className="mr-2"
            />
            Yes
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="no"
              checked={formData?.livingChildren === 'no'}
              onChange={(e) => handleInputChange(e, null, 'livingChildren')}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>
    </div>
  );

  const renderChildren = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Children</h3>
      {formData?.children?.map((child, index) => (
        <div key={index} className="p-4 border rounded space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={child.fullName || ''}
              onChange={(e) => handleInputChange(e, 'children', 'fullName', index)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              value={child.dateOfBirth || ''}
              onChange={(e) => handleInputChange(e, 'children', 'dateOfBirth', index)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={child.address || ''}
              onChange={(e) => handleInputChange(e, 'children', 'address', index)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const newChildren = formData.children.filter((_, i) => i !== index);
              setFormData({ ...formData, children: newChildren });
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Remove Child
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const newChildren = [...(formData.children || []), {
            fullName: '',
            dateOfBirth: '',
            address: ''
          }];
          setFormData({ ...formData, children: newChildren });
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Child
      </button>
    </div>
  );

  const renderBeneficiaries = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Beneficiaries</h3>
      {formData?.beneficiaries?.map((beneficiary, index) => (
        <div key={index} className="p-4 border rounded space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={beneficiary.fullName || ''}
              onChange={(e) => handleInputChange(e, 'beneficiaries', 'fullName', index)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Relationship</label>
            <input
              type="text"
              value={beneficiary.relationship || ''}
              onChange={(e) => handleInputChange(e, 'beneficiaries', 'relationship', index)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Share Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={beneficiary.sharePercentage || ''}
              onChange={(e) => handleInputChange(e, 'beneficiaries', 'sharePercentage', index)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
              setFormData({ ...formData, beneficiaries: newBeneficiaries });
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Remove Beneficiary
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const newBeneficiaries = [...(formData.beneficiaries || []), {
            fullName: '',
            relationship: '',
            sharePercentage: ''
          }];
          setFormData({ ...formData, beneficiaries: newBeneficiaries });
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Beneficiary
      </button>
    </div>
  );

  const renderAssets = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Assets and Possessions</h3>
      {formData?.possessions?.map((possession, index) => (
        <div key={index} className="p-4 border rounded space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={possession.type || ''}
              onChange={(e) => handleInputChange(e, 'possessions', 'type', index)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select...</option>
              <option value="Property">Property</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Bank Account">Bank Account</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={possession.description || ''}
              onChange={(e) => handleInputChange(e, 'possessions', 'description', index)}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estimated Value</label>
            <input
              type="number"
              value={possession.value || ''}
              onChange={(e) => handleInputChange(e, 'possessions', 'value', index)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const newPossessions = formData.possessions.filter((_, i) => i !== index);
              setFormData({ ...formData, possessions: newPossessions });
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Remove Possession
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const newPossessions = [...(formData.possessions || []), {
            type: '',
            description: '',
            value: ''
          }];
          setFormData({ ...formData, possessions: newPossessions });
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Possession
      </button>
    </div>
  );

  if (!formData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Will</h2>
        <div className="space-x-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save as Draft
          </button>
          <button
            onClick={handleFinalize}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
             Finalize Will
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {currentStep === 1 && renderPersonalInfo()}
        {currentStep === 2 && renderFamilyStatus()}
        {currentStep === 3 && renderChildren()}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Spouse Information</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Spouse's Full Name</label>
              <input
                type="text"
                value={formData?.spouse?.fullName || ''}
                onChange={(e) => handleInputChange(e, 'spouse', 'fullName')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Relationship Status</label>
              <select
                value={formData?.spouse?.relationship || ''}
                onChange={(e) => handleInputChange(e, 'spouse', 'relationship')}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                <option value="married">Married</option>
                <option value="separated">Separated</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>
          </div>
        )}
        {currentStep === 5 && renderBeneficiaries()}
        {currentStep === 6 && renderAssets()}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Executors</h3>
            {formData?.executors?.map((executor, index) => (
              <div key={index} className="p-4 border rounded space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={executor.name || ''}
                    onChange={(e) => handleInputChange(e, 'executors', 'name', index)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Relationship</label>
                  <input
                    type="text"
                    value={executor.relationship || ''}
                    onChange={(e) => handleInputChange(e, 'executors', 'relationship', index)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Information</label>
                  <input
                    type="email"
                    value={executor.email || ''}
                    onChange={(e) => handleInputChange(e, 'executors', 'email', index)}
                    className="w-full p-2 border rounded"
                    placeholder="Email"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newExecutors = [...(formData.executors || []), {
                  name: '',
                  relationship: '',
                  email: ''
                }];
                setFormData({ ...formData, executors: newExecutors });
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Executor
            </button>
          </div>
        )}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Witnesses</h3>
            {formData?.witnesses?.map((witness, index) => (
              <div key={index} className="p-4 border rounded space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={witness.name || ''}
                    onChange={(e) => handleInputChange(e, 'witnesses', 'name', index)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={witness.address || ''}
                    onChange={(e) => handleInputChange(e, 'witnesses', 'address', index)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Information</label>
                  <input
                    type="email"
                    value={witness.email || ''}
                    onChange={(e) => handleInputChange(e, 'witnesses', 'email', index)}
                    className="w-full p-2 border rounded"
                    placeholder="Email"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {currentStep === 9 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Final Wishes</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Funeral Arrangements</label>
              <textarea
                value={formData?.funeralArrangements || ''}
                onChange={(e) => handleInputChange(e, null, 'funeralArrangements')}
                className="w-full p-2 border rounded"
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Special Instructions</label>
              <textarea
                value={formData?.specialInstructions || ''}
                onChange={(e) => handleInputChange(e, null, 'specialInstructions')}
                className="w-full p-2 border rounded"
                rows="4"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EditWill;

        
