import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";
import { handlePostLogin } from "../../utils/postLoginHandler.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Supabase automatically exchanges the code for a session
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !data.session) {
          throw new Error(sessionError?.message || "Failed to authenticate");
        }

        const user = data.session.user;

        // Use shared post-login handler
        await handlePostLogin(user, navigate);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err.message || "Authentication failed");
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-sm text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-red-600 text-white rounded-full px-6 py-2 hover:bg-red-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          {loading ? "Completing login..." : "Redirecting..."}
        </h2>
      </div>
    </div>
  );
}
