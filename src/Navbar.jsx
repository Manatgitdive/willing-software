// Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const Navbar = ({ userEmail, subscription }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleChangePlan = async () => {
    try {
      // Delete current subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', user.id);
      }
      navigate('/subscription');
    } catch (error) {
      console.error('Error changing plan:', error.message);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="text-lg font-semibold text-gray-800">
              Will Generator
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <span className="text-xs text-gray-500">
                {subscription === 'yearly' ? 'Yearly Plan' : 'One-Time Plan'}
              </span>
            </div>

            <div className="relative group">
              <button className="flex items-center p-2 rounded-md hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="absolute right-0 w-48 mt-2 py-2 bg-white border rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={handleChangePlan}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Change Plan
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;