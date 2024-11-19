import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { supabase } from './supabaseClient';
import Navbar from './Navbar';

// Separate LoadingSpinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Layout component without useLocation
const Layout = ({ children, userEmail, subscription }) => {
  return (
    <div>
      {userEmail && <Navbar userEmail={userEmail} subscription={subscription} />}
      <main className="pt-4">{children}</main>
    </div>
  );
};

// Main App component
const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          setUserEmail(user.email);
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_type, subscription_end')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.subscription_type === 'yearly' && 
                profile.subscription_end && 
                new Date(profile.subscription_end) < new Date()) {
              setSubscription('expired');
            } else {
              setSubscription(profile.subscription_type);
            }
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setUserEmail(session.user.email);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Layout userEmail={userEmail} subscription={subscription}>
        <AppRoutes user={user} />
      </Layout>
    </BrowserRouter>
  );
};

export default App;
