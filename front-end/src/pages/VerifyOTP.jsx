import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyPasswordResetOTP, requestPasswordReset } from "../services/authService";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Please request a password reset first.
          </p>
          <Link
            to="/forgot-password"
            className="mt-3 inline-block font-medium underline"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }




  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
        setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
    }, [cooldown]);




    const handleResendOTP = async () => {
        if (cooldown > 0 || isResending) return;

        setIsResending(true);

        try {
            const response = await requestPasswordReset(email);

            setOtp("");
            setCooldown(60);

            toast.success("A new OTP has been requested.");

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsResending(false);
        }
        };




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyPasswordResetOTP(email, otp);

      toast.success(response.message);

      navigate("/reset-password", {
        replace: true,
        state: {
          resetToken: response.reset_token,
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
            Verify your email
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Enter the six-digit OTP sent to {email}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-black"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
          />

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        <div className="mt-8 text-center">

            <p className="text-sm text-gray-500">
                Didn't receive the OTP?
            </p>

            <button
                type="button"
                onClick={handleResendOTP}
                disabled={cooldown > 0 || isResending}
                className={`mt-2 text-sm font-semibold transition ${
                cooldown > 0 || isResending
                    ? "cursor-not-allowed text-gray-400"
                    : "text-black hover:underline"
                }`}
            >
                {isResending
                ? "Sending OTP..."
                : cooldown > 0
                    ? `Resend OTP in 00:${String(cooldown).padStart(2, "0")}`
                    : "Resend OTP"}
            </button>

        </div>

      </div>
    </div>
  );
}
