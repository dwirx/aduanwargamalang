import { supabase } from './supabase';

// Check if user is admin
export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  const { data, error } = await supabase
    .from('admins')
    .select('email')
    .eq('email', email)
    .single();
  
  return !error && !!data;
}

// Get all admins
export async function getAdmins() {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Add new admin
export async function addAdmin(email: string, createdBy: string) {
  const { data, error } = await supabase
    .from('admins')
    .insert({ email, created_by: createdBy })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Remove admin
export async function removeAdmin(email: string) {
  // Prevent removing the main admin
  if (email === 'bangundwir@gmail.com') {
    throw new Error('Cannot remove main admin');
  }
  
  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('email', email);
  
  if (error) throw error;
}

// Delete flood report (admin only)
export async function deleteReport(reportId: string) {
  const { error } = await supabase
    .from('flood_reports')
    .delete()
    .eq('id', reportId);
  
  if (error) throw error;
}
