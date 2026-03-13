import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xckutifpuzfkqesspciu.supabase.co';
const supabaseKey = 'sb_publishable_e3w-oFmFrWsucNkuQquA0Q_jd-R2k-9';

export const supabase = createClient(supabaseUrl, supabaseKey);
