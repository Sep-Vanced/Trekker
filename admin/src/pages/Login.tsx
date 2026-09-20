import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { clearToken } from "@/api/client";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
        const user = await login(username, password);
        if (user.role !== "ranger") {
            clearToken();
            setError("This account doesn't have ranger/admin access.");
            return;
        }
        navigate("/");
    } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F4F4]">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-black/5"
            >
                <h1 className="text-2xl font-black text-[#0C1618] mb-6">Admin Login</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <label className="block text-xs font-bold uppercase tracking-widest text-[#0C1618]/50 mb-1">
                    Username
                </label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    required
                    className="w-full mb-4 px-4 py-3 bg-[#F4F4F4] rounded-2xl outline-none focus:ring-2 focus:ring-[#0C8345]/30"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#0C1618]/50 mb-1">
                    Password
                </label>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    className="w-full mb-6 px-4 py-3 bg-[#F4F4F4] rounded-2xl outline-none focus:ring-2 focus:ring-[#0C8345]/30"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0C1618] text-white font-bold rounded-2xl disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </div>
    );
}