import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import useAuth from "../hooks/useAuth";


export default function ProtectedRoute() {

    const {
        isAuthenticated,
        // loading
    } = useAuth();

    const location = useLocation();

    const navigate = useNavigate();

    // if (loading) {
    //     return (
    //         <div className="flex min-h-screen items-center justify-center">
    //             Loading...
    //         </div>
    //     );
    // }

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
                        Please login to access this page.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/Login",
                                {
                                    state: {
                                        from: location
                                    }
                                }
                            )
                        }
                        className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-medium text-white transition hover:bg-gray-800"
                    >
                        Go To Login
                    </button>

                </div>

            </div>
        );
    }

    return <Outlet />;
}