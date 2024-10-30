// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thfcwowrxeklmkervzhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZmN3b3dyeGVrbG1rZXJ2emhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNTg1MDMsImV4cCI6MjA0NDczNDUwM30.vBg4PyyKoURz1BqAFNPo77h9XA8hyW_ZMOsxIYNvNCU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export const willService = {
    async createWill(willData) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
  
        const { data, error } = await supabase
          .from('wills')
          .insert([{
            user_id: user.id,
            content: willData,
            status: 'draft',
            testator_name: willData.testatorName,
            occupation: willData.occupation,
            address: willData.address,
            parish: willData.parish,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
  
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Error creating will:', error);
        return { data: null, error };
      }
    },
  
    async updateWill(willId, willData) {
      try {
        const { data, error } = await supabase
          .from('wills')
          .update({
            content: willData,
            testator_name: willData.testatorName,
            occupation: willData.occupation,
            address: willData.address,
            parish: willData.parish,
            updated_at: new Date().toISOString()
          })
          .eq('id', willId)
          .select()
          .single();
  
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Error updating will:', error);
        return { data: null, error };
      }
    },
  
    async getWill(willId) {
      try {
        const { data, error } = await supabase
          .from('wills')
          .select('*')
          .eq('id', willId)
          .single();
  
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Error fetching will:', error);
        return { data: null, error };
      }
    },
  
    async getUserWills() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
  
        const { data, error } = await supabase
          .from('wills')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Error fetching user wills:', error);
        return { data: null, error };
      }
    },
  
    async deleteWill(willId) {
      try {
        const { error } = await supabase
          .from('wills')
          .delete()
          .eq('id', willId);
  
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error('Error deleting will:', error);
        return { error };
      }
    }
  };
  
  // Document storage service
  export const documentService = {
    async uploadPDF(willId, pdfBytes, fileName) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
  
        const filePath = `${user.id}/${willId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('will-documents')
          .upload(filePath, pdfBytes);
  
        if (uploadError) throw uploadError;
  
        const { error: dbError } = await supabase
          .from('documents')
          .insert([{
            will_id: willId,
            user_id: user.id,
            file_name: fileName,
            file_path: filePath,
            file_type: 'application/pdf',
            document_type: 'will_pdf'
          }]);
  
        if (dbError) throw dbError;
        return { error: null, filePath };
      } catch (error) {
        console.error('Error uploading PDF:', error);
        return { error };
      }
    }
  };
  
  // Subscription service
  export const subscriptionService = {
    async checkSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
  
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
  
        if (error && error.code !== 'PGRST116') throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Error checking subscription:', error);
        return { data: null, error };
      }
    }
  };