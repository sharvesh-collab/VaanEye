import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vtqngdbktwgrqyivdnnr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_QfAEEXxlJnLERGi3VM5HiQ__e9OUTSU';

export const supabase = createClient(supabaseUrl, supabaseKey);
