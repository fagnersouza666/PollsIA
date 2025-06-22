import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

export const supabase =
  config.SUPABASE_URL && config.SUPABASE_KEY
    ? createClient(config.SUPABASE_URL, config.SUPABASE_KEY)
    : {
        from() {
          return { insert: async () => ({ error: null }) };
        },
      } as any;
