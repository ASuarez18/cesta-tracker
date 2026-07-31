import React, { useState } from "react";
import { authApi } from "../../../lib/api/auth";

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @function handleSubmit
   * @desc Handles the form submission for user register
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.register(name, email, password);
      window.location.href = "/app/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full">
      {error && (
        <div className="p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm sm:text-base font-semibold text-carbon-black-800 mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm bg-white border border-carbon-black-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 focus:border-transparent transition-all placeholder:text-carbon-black-400 text-carbon-black-900"
        />
      </div>

      <div>
        <label className="block text-sm sm:text-base font-semibold text-carbon-black-800 mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm bg-white border border-carbon-black-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 focus:border-transparent transition-all placeholder:text-carbon-black-400 text-carbon-black-900"
        />
      </div>

      <div>
        <label className="block text-sm sm:text-base font-semibold text-carbon-black-800 mb-1.5">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm bg-white border border-carbon-black-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 focus:border-transparent transition-all placeholder:text-carbon-black-400 text-carbon-black-900"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 sm:py-3 px-4 bg-celadon-600 hover:bg-celadon-700 text-white font-semibold text-base rounded-lg sm:rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-xs sm:text-sm text-carbon-black-600 pt-2">
        Already have an account?{" "}
        <a href="/login" className="text-celadon-700 font-semibold hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
};