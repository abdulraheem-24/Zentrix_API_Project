import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "../AdminSide/components/navbar";
import SideBar from "../AdminSide/components/sidebar";
import useAuth from "../hooks/useAuth";
import { ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function AdminLayout() {
    const { user, isAuthenticated, Logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === "customer" || (user?.role && user.role !== "admin")) {
            toast.error("You do not have Administrator permissions!");
            Logout();
            navigate("/Login");
        }
    }, [user, Logout, navigate]);

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                        <ShoppingCart size={28} />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900">
                        Login Required
                    </h2>

                    <p className="mt-3 text-gray-500">
                        Please login with an administrator account to access this page.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/Login", {
                                state: {
                                    from: location,
                                },
                            })
                        }
                        className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-medium text-white transition hover:bg-gray-800 cursor-pointer"
                    >
                        Go To Login
                    </button>
                </div>
            </div>
        );
    }

    if (user?.role !== "admin") {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
                    <h1 className="text-3xl font-bold text-red-500 mb-3">
                        Access Denied
                    </h1>

                    <p className="text-gray-600">
                        You do not have permission to access the admin portal.
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="mt-8 px-8 py-3 text-sm font-bold rounded-2xl bg-black text-white hover:bg-gray-800 transition-all cursor-pointer"
                    >
                        Go to Home Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar />

            <div className="flex-1 min-w-0 flex flex-col">
                <AdminNavbar />

                <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-5 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
