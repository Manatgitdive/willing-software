import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

const PrivateRoute = ({ children, requiredSubscription = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user && requiredSubscription) {
          // Check subscription status from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_type, subscription_end')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching subscription:', error);
            return;
          }

          // Check if yearly subscription is expired
          if (profile?.subscription_type === 'yearly' && 
              profile.subscription_end && 
              new Date(profile.subscription_end) < new Date()) {
            setSubscription('expired');
          } else {
            setSubscription(profile?.subscription_type);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user && requiredSubscription) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_type, subscription_end')
            .eq('id', session.user.id)
            .single();

          if (profile?.subscription_type === 'yearly' && 
              profile.subscription_end && 
              new Date(profile.subscription_end) < new Date()) {
            setSubscription('expired');
          } else {
            setSubscription(profile?.subscription_type);
          }
        }
      }
    );

    return () => {
      authSubscription?.unsubscribe();
    };
  }, [requiredSubscription]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle route access based on subscription type and route
  if (requiredSubscription) {
    if (!subscription) {
      return <Navigate to="/subscription" replace />;
    }

    // For form access
    if (location.pathname === '/form') {
      // Allow both onetime and yearly subscribers to access form
      if (subscription !== 'onetime' && subscription !== 'yearly') {
        return <Navigate to="/subscription" replace />;
      }
    }
    // For dashboard access
    else if (location.pathname === '/dashboard') {
      // Only allow yearly subscribers to access dashboard
      if (subscription !== 'yearly') {
        return <Navigate to="/subscription" replace />;
      }
    }
  }

  return children;
};

export default PrivateRoute;