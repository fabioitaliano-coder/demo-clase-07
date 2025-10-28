const { createClient } = require('@supabase/supabase-js');

// Las mismas credenciales que usamos en el frontend
const supabaseUrl = 'https://nelfuehxnqcrkroikhdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbGZ1ZWh4bnFjcmtyb2lraGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTMzMjIsImV4cCI6MjA3NjYyOTMyMn0.aiZT1CmBi0AHkz_k1ZRKYbxq1-Je1I5dGS6-MflBClk';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;