import successAnimation from "../assets/animation/Order-completed.json";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetOrderState } from "../redux/slice/orderSlice";
import { default as Lottie } from "lottie-react";

export default function OrderSuccess() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    console.log(typeof Lottie)

    useEffect(() => {

        dispatch(resetOrderState());

        const timer = setTimeout(() => {

            navigate("/orders");

        }, 1000);

        return () => clearTimeout(timer);

    }, [dispatch, navigate]);

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

                <div className="flex flex-col items-center text-center">

                    <div className="h-72 w-72">
                        {/* <Lottie
                            animationData={successAnimation}
                            loop={false}
                        /> */}
                    </div>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Order Successful
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Your order has been placed successfully.
                    </p>

                    <div className="mt-6 rounded-2xl bg-green-50 px-5 py-3 text-sm font-medium text-green-700">
                        Thank you for shopping with us ✨
                    </div>

                </div>

            </div>

        </div>
    );
}