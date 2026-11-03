import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pvsoezqffeofnytokwwk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c29lenFmZmVvZm55dG9rd3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzE3NDQsImV4cCI6MjA4NDI0Nzc0NH0.DizBKt7eGVwTJ0i_LjBikVpNkhf6uWbC1u2zbpAHops";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
