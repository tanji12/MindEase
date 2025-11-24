#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  console.error('Set them and re-run. Example (PowerShell):');
  console.error("$env:SUPABASE_URL='https://xyz.supabase.co'; $env:SUPABASE_SERVICE_ROLE_KEY='service_role...'; node .\\scripts\\create-admin.js");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function run() {
  const email = 'mindease.baust@gmail.com';
  const password = 'Admin11';

  console.log('Creating/updating admin user:', email);

  try {
    // Try to find existing user by email
    const { data: users, error: listErr } = await supabase.rpc('auth_admin_list_users', { });
    // Fallback if rpc not available: use admin API via the client
  } catch (e) {
    // ignore - proceed to create user via admin endpoint below
  }

  // Use the Admin API helper available in supabase-js v2
  try {
    // createUser through admin endpoint
    // supabase-js v2 exposes admin functions under auth.admin
    // This call requires the service_role key
    // It may return either { data: user } or { user }
    const createArgs = { email, password, email_confirm: true };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const res = await supabase.auth.admin.createUser(createArgs);

    let userId = null;
    if (res?.data?.user?.id) userId = res.data.user.id;
    if (res?.user?.id) userId = res.user.id;
    if (!userId) {
      // If createUser returned an error or user already exists, attempt to find the user
      const { data: found, error: fetchErr } = await supabase.auth.admin.listUsers?.() || { data: null, error: null };
      if (fetchErr) throw fetchErr;
      const match = (found?.users || found)?.find?.((u) => u.email === email);
      userId = match?.id;
    }

    if (!userId) throw new Error('Unable to determine created user id');

    console.log('User id:', userId);

    // Insert admin role into public.user_roles if not exists
    const { data: roleData, error: roleErr } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      const { error: insertErr } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);
      if (insertErr) throw insertErr;
      console.log('Assigned admin role to user.');
    } else {
      console.log('User already has admin role.');
    }

    console.log('Done. You should now be able to sign in with the provided credentials.');
  } catch (err) {
    console.error('Error creating user or assigning role:', err);
    process.exit(1);
  }
}

run();
