// src/willOperations.js

import { supabase } from './supabaseClient';

export const saveWillToSupabase = async (formData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Save main will data
    const { data: will, error: willError } = await supabase
      .from('wills')
      .insert([
        {
          user_id: user.id,
          testator_name: formData.testatorName,
          prefix: formData.prefix,
          suffix: formData.suffix,
          occupation: formData.occupation,
          address: formData.address,
          parish: formData.parish,
          content: formData // Store full form data as JSON
        }
      ])
      .select()
      .single();

    if (willError) throw willError;

    // Save witnesses
    if (formData.witnesses?.length > 0) {
      const { error: witnessError } = await supabase
        .from('witnesses')
        .insert(
          formData.witnesses.map(witness => ({
            will_id: will.id,
            user_id: user.id,
            full_name: witness.name,
            email: witness.email,
            address: witness.address,
            parish: witness.parish,
            occupation: witness.occupation
          }))
        );

      if (witnessError) throw witnessError;
    }

    // Save executors
    if (formData.executors?.length > 0) {
      const { error: executorError } = await supabase
        .from('executors')
        .insert(
          formData.executors.map(executor => ({
            will_id: will.id,
            user_id: user.id,
            full_name: executor.name,
            relationship: executor.relationship,
            email: executor.email,
            occupation: executor.occupation,
            address: executor.address,
            parish: executor.parish
          }))
        );

      if (executorError) throw executorError;
    }

    return { success: true, willId: will.id };
  } catch (error) {
    console.error('Error saving will:', error);
    return { success: false, error: error.message };
  }
};

export const updateWillInSupabase = async (willId, formData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Update main will data
    const { error: willError } = await supabase
      .from('wills')
      .update({
        testator_name: formData.testatorName,
        prefix: formData.prefix,
        suffix: formData.suffix,
        occupation: formData.occupation,
        address: formData.address,
        parish: formData.parish,
        content: formData
      })
      .eq('id', willId)
      .eq('user_id', user.id);

    if (willError) throw willError;

    // Delete existing witnesses and add new ones
    await supabase
      .from('witnesses')
      .delete()
      .eq('will_id', willId);

    if (formData.witnesses?.length > 0) {
      const { error: witnessError } = await supabase
        .from('witnesses')
        .insert(
          formData.witnesses.map(witness => ({
            will_id: willId,
            user_id: user.id,
            full_name: witness.name,
            email: witness.email,
            address: witness.address,
            parish: witness.parish,
            occupation: witness.occupation
          }))
        );

      if (witnessError) throw witnessError;
    }

    // Delete existing executors and add new ones
    await supabase
      .from('executors')
      .delete()
      .eq('will_id', willId);

    if (formData.executors?.length > 0) {
      const { error: executorError } = await supabase
        .from('executors')
        .insert(
          formData.executors.map(executor => ({
            will_id: willId,
            user_id: user.id,
            full_name: executor.name,
            relationship: executor.relationship,
            email: executor.email,
            occupation: executor.occupation,
            address: executor.address,
            parish: executor.parish
          }))
        );

      if (executorError) throw executorError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating will:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWillFromSupabase = async (willId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('wills')
      .delete()
      .eq('id', willId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting will:', error);
    return { success: false, error: error.message };
  }
};

export const fetchWillsFromSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('wills')
      .select(`
        *,
        witnesses (*),
        executors (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, wills: data };
  } catch (error) {
    console.error('Error fetching wills:', error);
    return { success: false, error: error.message };
  }
};