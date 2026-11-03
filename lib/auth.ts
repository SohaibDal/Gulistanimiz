import { supabase } from "./supabase";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = AuthSession.makeRedirectUri({
    useProxy: true
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo
    }
  });

  if (error) {
    return { error };
  }

  const result = await AuthSession.startAsync({
    authUrl: data.url
  });

  if (result.type !== "success") {
    return { error: { message: "Google sign-in cancelled" } };
  }

  return { error: null };
}
  
export function signOut() {
  return supabase.auth.signOut();
}
