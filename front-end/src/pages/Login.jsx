import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, replace, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { loginUser } from "../services/authService";
import useAuth from "../hooks/useAuth";
import { useSelector } from "react-redux";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { Login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const user = await Login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (user.status === "blocked") {
        toast.error("Your Login access has been blocked");
        return;
      }

      toast.success("Login Successful!");
      
      if (user.role === "admin") {
        navigate("/admin/adminDashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Failed to Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center relative bottom-5 justify-center bg-[#f5f5f5] px-4">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full max-w-md rounded-3xl bg-white px-8 py-12 shadow-xl">
          {/* LOGO */}
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            <span className="italic font-bold">Z</span>entrix
          </h1>

          {/* HEADING */}
          <div className="mt-10">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Login to continue shopping your favorite electronics.
            </p>
          </div>

          {/* FORM */}
          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-black">
              <Mail size={18} className="text-gray-400" />

              <input
                type="email"
                placeholder="Email address"
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            {/* PASSWORD */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-black">
              <LockKeyhole size={18} className="text-gray-400" />

              <input
                type="password"
                placeholder="Password"
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>

            <button
              className="w-full rounded-xl bg-black py-3 text-sm font-medium tracking-wide text-white transition hover:bg-gray-800"
              type="submit"
            >
              Login
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to={"/Register"}>
              <span className="cursor-pointer font-medium text-black hover:underline">
                Create account
              </span>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
