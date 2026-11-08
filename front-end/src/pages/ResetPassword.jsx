
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetUserPassword } from "../services/authService";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const resetToken = location.state?.resetToken;

  if (!resetToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Your reset session is missing or expired.
          </p>
          <Link
            to="/forgot-password"
            className="mt-3 inline-block font-medium underline"
          >
            Start again
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetUserPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.success(response.message);

      navigate("/Login", { replace: true });

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
            Create new password
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Enter your new password and confirm it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <input
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Reset Password"}
          </button>

        </form>

      </div>
    </div>
  );
}
