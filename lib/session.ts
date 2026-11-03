import { supabase } from "./supabase";

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export function onAuthChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
