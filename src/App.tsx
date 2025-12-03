import { useState, useEffect, type CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

// --------------------------------------------------------
// PASTE YOUR SUPABASE KEYS HERE
// --------------------------------------------------------
const supabaseUrl = "https://lgauakccunyetdbgjqjc.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYXVha2NjdW55ZXRkYmdqcWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTAzMDUsImV4cCI6MjA4MDMyNjMwNX0.tYw3SAo_iPfUQSzbS4akgMi1XXQo7DVPDcfIUh7W0BU";
// --------------------------------------------------------

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check if user is already logged in when the page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes (like if they log out or log in)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        // Set a cookie that expires in 30 days
        const date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
        document.cookie = `extension_auth_token=${
          session.access_token
        }; expires=${date.toUTCString()}; path=/`;
      } else {
        // Remove cookie if logged out
        document.cookie =
          "extension_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    // This sends them to Google to login
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // Brings them back here after login
      },
    });
  };

  // --------------------------------------------------------
  // SCREEN 1: User is Logged In
  // --------------------------------------------------------
  if (session) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.successTitle}>Success! ✅</h1>
          <p style={styles.text}>You are logged in.</p>
          <p style={styles.subtext}>
            You can now open the Chrome Extension and start using it.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // SCREEN 2: User needs to Login
  // --------------------------------------------------------
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome</h1>
        <p style={styles.text}>Please sign in to activate the tool.</p>
        <button onClick={handleLogin} style={styles.button}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

// Simple styles to make it look clean and centered
const styles: Record<string, CSSProperties> = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#333",
  },
  successTitle: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#10b981", // Green color
  },
  text: {
    color: "#666",
    marginBottom: "24px",
  },
  subtext: {
    fontSize: "14px",
    color: "#888",
    marginTop: "10px",
  },
  button: {
    backgroundColor: "#4285F4", // Google Blue
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "500",
    width: "100%",
  },
};
