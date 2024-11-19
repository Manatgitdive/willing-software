// src/documentOperations.js

import { supabase } from './supabaseClient';

export const uploadDocument = async (willId, file) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Create unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${willId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save document reference in database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        will_id: willId,
        user_id: user.id,
        name: file.name,
        file_path: filePath,
        file_type: file.type
      });

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: error.message };
  }
};

export const downloadDocument = async (filePath, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (error) throw error;

    // Create and trigger download
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading document:', error);
    return { success: false, error: error.message };
  }
};