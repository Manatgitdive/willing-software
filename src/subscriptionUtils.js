import { supabase } from './supabaseClient';

export const checkSubscription = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_end')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    if (profile.subscription_type === 'yearly' && 
        profile.subscription_end && 
        new Date(profile.subscription_end) < new Date()) {
      return 'expired';
    }
    
    return profile.subscription_type;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return null;
  }
};