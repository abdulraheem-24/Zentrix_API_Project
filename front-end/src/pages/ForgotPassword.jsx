
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import { requestPasswordReset } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestPasswordReset(email);

      toast.success(response.message);

      navigate("/verify-otp", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white px-8 py-12 shadow-xl">

        <h1 className="text-3xl font-semibold text-black">
          <span className="italic font-bold">Z</span>entrix
        </h1>

        <div className="mt-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Forgot password?
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Enter your registered email address. If an account
            exists, we will send you a password reset OTP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-black">
            <Mail size={18} className="text-gray-400" />

            <input
              type="email"
              placeholder="Email address"
              className="ml-3 w-full bg-transparent text-sm outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>

        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            to="/Login"
            className="font-medium text-black hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
