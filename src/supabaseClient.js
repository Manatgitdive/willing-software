// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thfcwowrxeklmkervzhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZmN3b3dyeGVrbG1rZXJ2emhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNTg1MDMsImV4cCI6MjA0NDczNDUwM30.vBg4PyyKoURz1BqAFNPo77h9XA8hyW_ZMOsxIYNvNCU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);