'use client';

import { useRegisterMutation } from '@/store/authApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [register] = useRegisterMutation();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await register(formData).unwrap();
      console.log("res:", res);

      if (res?.data === "success") {
        setSuccessMessage("✅ Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrorMessage(res.data);
      }
    } catch (error: any) {
      console.error("Register error:", error);
      setErrorMessage(error?.error || "❌ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>

        {errorMessage && (
          <div className="mb-4 text-red-400 text-sm bg-red-800/30 px-4 py-2 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 text-green-400 text-sm bg-green-800/30 px-4 py-2 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="name">Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="mobile">Mobile Number</label>
            <input
              name="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              placeholder="Your mobile number"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="email">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 mt-2 bg-white text-black rounded hover:bg-gray-300 transition disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account? <a href="/login" className="text-white underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
