import { LockKeyhole, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify"

export default function RegisterPage() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading , setIsLoading] = useState(false);

  const { Register } = useAuth();

  const navigate = useNavigate()

  async function handleSubmit (e) {
    e.preventDefault();
    if ( !username.trim() || !email.trim() || !password || !confirmPassword ) {
      toast.error("Please fill in all fields");
      return;
    }

    if ( password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await Register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
      });

      toast.success("Registration Successful! Please log in.");
      navigate("/Login", {replace : true})
    }catch (error) {
      toast.error(error.message || "Failed to Register")
    }finally{
      setIsLoading(false);
    }
  }
  
  return (
    <div className="flex min-h-screen items-center relative bottom-8 justify-center bg-[#f5f5f5] px-4">

      {isLoading ? (
        <div>
          <h4>Loading........</h4>
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
              Create account
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Register to start shopping your favorite electronics.
            </p>
          </div>

          {/* FORM */}
          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>

            {/* USERNAME */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-black">
              <User size={18} className="text-gray-400" />

              <input
                type="text"
                placeholder="Username"
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </div>

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

            {/* CONFIRM PASSWORD */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-black">
              <LockKeyhole size={18} className="text-gray-400" />

              <input
                type="password"
                placeholder="Confirm Password"
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>

            {/* BUTTON */}
            <button 
                className="w-full rounded-xl bg-black py-3 text-sm font-medium tracking-wide text-white transition hover:bg-gray-800"
                type="submit">
              Register
            </button>
          </form>

          {/* LOGIN */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to={"/Login"}>
              <span className="cursor-pointer font-medium text-black hover:underline">
                Login
              </span>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}