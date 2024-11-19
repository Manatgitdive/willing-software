import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

const SubscriptionChoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    checkCurrentSubscription();
  }, []);

  const checkCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_type, subscription_end')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        if (profile.subscription_type === 'yearly' && 
            profile.subscription_end && 
            new Date(profile.subscription_end) < new Date()) {
          setCurrentSubscription('expired');
        } else {
          setCurrentSubscription(profile.subscription_type);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setError('Error checking subscription status.');
    }
  };

  const handleSubscriptionSelect = async (type) => {
    try {
      setLoading(true);
      setError(null);
  
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
  
      if (!user) {
        navigate('/login');
        return;
      }
  
      // Update subscription
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_type: type,
          subscription_start: new Date().toISOString(),
          subscription_end: type === 'yearly' ? 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : 
            null
        })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      // Navigate based on subscription type
      if (type === 'onetime') {
        navigate('/form', { 
          state: { 
            subscriptionType: 'onetime',
            isNew: true
          },
          replace: true  // Add this to replace the current route
        });
      } else if (type === 'yearly') {
        navigate('/dashboard', { 
          state: { 
            subscriptionType: 'yearly'
          },
          replace: true  // Add this to replace the current route
        });
      }
  
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Error selecting subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentSubscription === 'yearly' && !location.state?.expired) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>You have an active yearly subscription.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {currentSubscription === 'expired' && (
        <div className="mb-8 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Your subscription has expired. Please select a new plan.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* One-Time Plan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h3 className="text-2xl font-bold text-gray-900">One-Time Use</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-5xl font-extrabold tracking-tight text-gray-900">$99</span>
              <span className="ml-1 text-xl font-semibold text-gray-500">/one-time</span>
            </div>
            <p className="mt-5 text-lg text-gray-500">Perfect for single use</p>
            <button
              onClick={() => handleSubscriptionSelect('onetime')}
              disabled={loading}
              className={`mt-8 block w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Select One-Time Plan'}
            </button>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Generate one will</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Download PDF</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Basic features</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Yearly Plan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-500 relative">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl text-sm">
            Best Value
          </div>
          <div className="px-6 py-8">
            <h3 className="text-2xl font-bold text-gray-900">Yearly Subscription</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-5xl font-extrabold tracking-tight text-gray-900">$199</span>
              <span className="ml-1 text-xl font-semibold text-gray-500">/year</span>
            </div>
            <p className="mt-5 text-lg text-gray-500">Best value for multiple wills</p>
            <button
              onClick={() => handleSubscriptionSelect('yearly')}
              disabled={loading}
              className={`mt-8 block w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Select Yearly Plan'}
            </button>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Unlimited wills</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Dashboard access</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Document storage</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Edit anytime</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Premium support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Important Information</h4>
        <ul className="space-y-2 text-gray-600">
          <li>• One-time plan allows you to create and download a single will</li>
          <li>• Yearly subscription includes unlimited will creation and modifications</li>
          <li>• All plans include secure PDF generation</li>
          <li>• Subscription can be cancelled anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionChoice;