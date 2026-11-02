import {
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getData } from "../utils/LocalStorage";
import { placeOrder } from "../redux/slice/orderSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { clearCartState } from "../redux/slice/cartSlice";

export default function CheckoutPage() {

    const cartProducts = useSelector(state => state.cart.items);
    const user = getData("user");

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const { loading , success , error } = useSelector(state => state.order)


    const [orderData, setOrderData] = useState({
        fullName : "",
        email: "",
        phone: "",

        address: "",
        state: "",
        district: "",
        city: "",
        zipCode: "",

        paymentMethod: "card",

    });

    useEffect(() => {
        console.log(orderData.paymentMethod)
    },[orderData.paymentMethod]);


    function handleOrderData (e) {
        setOrderData({...orderData , [e.target.name] : e.target.value })
    }


    const subtotal = cartProducts.reduce(
        (acc, item) => acc + (item.price - (item.price * item.discount) / 100) * item.quantity, 0
    );

    const shipping = 0;
    //   const tax = 999;
    const total = subtotal + shipping ;

    
    async function handlePlaceOrder(e) {
        e.preventDefault();

        if (cartProducts.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (
            !orderData.fullName.trim() ||
            !orderData.email.trim() ||
            !orderData.phone.trim() ||
            !orderData.address.trim() ||
            !orderData.state.trim() ||
            !orderData.district.trim() ||
            !orderData.city.trim() ||
            !orderData.zipCode.trim()
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(orderData.email)) {
            toast.error("Enter a valid email");
            return;
        }

        const payload = {
            customer_name: orderData.fullName.trim(),
            customer_email: orderData.email.trim().toLowerCase(),
            customer_phone: orderData.phone.trim(),

            shipping_address: orderData.address.trim(),
            shipping_district: orderData.district.trim(),
            shipping_city: orderData.city.trim(),
            shipping_state: orderData.state.trim(),
            shipping_postal_code: orderData.zipCode.trim(),
            shipping_country: "India",

            payment_method: orderData.paymentMethod,
            save_address: false,
        };

        try {
            await dispatch(placeOrder(payload)).unwrap();

            // Django creates the order and empties the server-side cart.
            dispatch(clearCartState());

            toast.success("Order placed successfully");
            navigate("/orderSuccess", { replace: true });
        } catch (err) {
            const message =
            err.detail ||
            err.cart?.[0] ||
            err.stock?.[0] ||
            "Unable to place your order";

            toast.error(
            typeof message === "string" ? message : JSON.stringify(message),
            );
        }
    }


    useEffect(() => {
        if (error) {
            toast.error(error.message || "Something went wrong");
        }
    }, [error]);

    // useEffect(() => {
    //     console.log("order Successfull");
    //     let timer;
    //     if (success) {
    //         timer = setTimeout(() => {
    //             navigate("/orderSuccess");
    //         }, 1000);
    //     }
    //     return () => clearTimeout(timer);
    // }, [success]);
    

    return (
        <div className="min-h-screen bg-[#f5f7fb] py-8">
        <div className="mx-auto max-w-7xl px-4">
            {/* Header */}
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Checkout
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Complete your order securely and fast.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-sm text-gray-500">Items</p>
                        <h3 className="text-xl font-bold text-gray-900">
                            {cartProducts.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl bg-black px-5 py-4 text-white shadow-lg">
                        <p className="text-sm text-gray-300">Total</p>
                        <h3 className="text-xl font-bold">
                            ₹{subtotal ? `${total.toLocaleString("en-IN")}`: 0}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* LEFT SECTION */}
            <div className="space-y-8">
                {/* Shipping */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="rounded-2xl bg-gray-100 p-3">
                            <MapPin className="text-gray-700" size={24} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Shipping Information
                            </h2>

                            <p className="text-sm text-gray-500">
                                Enter your delivery details.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>

                            <input
                                name="fullName"
                                value={orderData.fullName}
                                onChange={handleOrderData}
                                type="text"
                                placeholder="john@example.com"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>

                            <input
                                name="email"
                                value={orderData.email}
                                onChange={handleOrderData}
                                type="email"
                                placeholder="john@example.com"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>

                            <input
                                name="phone"
                                value={orderData.phone}
                                onChange={handleOrderData}
                                type="tel"
                                placeholder="+91 98765 43210"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Street Address
                            </label>

                            <input
                                name="address"
                                value={orderData.address}
                                onChange={handleOrderData}
                                type="text"
                                placeholder="123 Main Street"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                State
                            </label>

                            <input
                                name="state"
                                value={orderData.state}
                                onChange={handleOrderData}
                                type="text"
                                placeholder="kerala"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                District
                            </label>

                            <input
                                name="district"
                                value={orderData.district}
                                onChange={handleOrderData}
                                type="text"
                                placeholder="Ernakulam"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                City
                            </label>

                            <input
                                name="city"
                                value={orderData.city}
                                onChange={handleOrderData}
                                type="text"
                                placeholder="Kochi"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                ZIP Code
                            </label>

                            <input
                                name="zipCode"
                                value={orderData.zipCode}
                                onChange={handleOrderData}
                                type="text"
                                placeholder="682001"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="rounded-2xl bg-gray-100 p-3">
                            <Wallet className="text-gray-700" size={24} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Payment Method
                            </h2>

                            <p className="text-sm text-gray-500">
                                Choose your preferred payment option.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 p-5 transition-all hover:border-black">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="card"
                                checked={orderData.paymentMethod === "card"}
                                onChange={handleOrderData} />

                            <div className="rounded-xl bg-gray-100 p-3">
                                <CreditCard size={22} className="text-gray-700" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                Credit / Debit Card
                                </h3>

                                <p className="text-sm text-gray-500">
                                Visa, Mastercard, American Express
                                </p>
                            </div>
                        </label>

                        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 p-5 transition-all hover:border-black">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="upi"
                                checked={orderData.paymentMethod === "upi"}
                                onChange={handleOrderData} />

                            <div className="rounded-xl bg-gray-100 p-3">
                                <Wallet size={22} className="text-gray-700" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">UPI Payment</h3>

                                <p className="text-sm text-gray-500">
                                Google Pay, PhonePe, Paytm
                                </p>
                            </div>
                        </label>

                        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 p-5 transition-all hover:border-black">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="cod"
                                checked={orderData.paymentMethod === "cod"}
                                onChange={handleOrderData} />

                            <div className="rounded-xl bg-gray-100 p-3">
                                <Truck size={22} className="text-gray-700" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                Cash on Delivery
                                </h3>

                                <p className="text-sm text-gray-500">
                                Pay when your order arrives
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    Order Summary
                </h2>

                {/* Products */}
                <div className="mt-6 space-y-4">
                    {cartProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex gap-4 rounded-2xl bg-gray-50 p-4"
                            >
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white">
                                <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                <h3 className="line-clamp-1 font-semibold text-gray-900">
                                    {product.name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {product.brand}
                                </p>
                                </div>

                                <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Qty: {product.quantity}
                                </span>

                                <span className="font-bold text-gray-900">
                                    ₹
                                    {(
                                    product.price * product.quantity
                                    ).toLocaleString("en-IN")}
                                </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coupon */}
                {/* <div className="mt-8 flex gap-3">
                    <input
                        type="text"
                        placeholder="Coupon code"
                        className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-black focus:bg-white"
                    />

                    <button className="rounded-2xl bg-gray-100 px-5 font-medium text-gray-900 transition hover:bg-gray-200">
                        Apply
                    </button>
                </div> */}

                {/* Pricing */}
                <div className="mt-8 space-y-5 border-t border-dashed border-gray-200 pt-6">
                    <div className="flex items-center justify-between text-gray-600">
                        <span>Subtotal</span>

                        <span>
                        ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                        <span>Shipping</span>

                        <span className="font-medium text-green-600">
                            Free
                        </span>
                    </div>

                    {/* <div className="flex items-center justify-between text-gray-600">
                        <span>Tax</span>

                        <span>
                        ₹{tax.toLocaleString("en-IN")}
                        </span>
                    </div> */}

                    <div className="flex items-center justify-between border-t border-gray-200 pt-5">
                        <span className="text-xl font-semibold text-gray-900">
                        Total
                        </span>

                        <span className="text-3xl font-bold text-black">
                            ₹{subtotal ? `${total.toLocaleString("en-IN")}`: 0}
                        </span>
                    </div>
                </div>

                {/* Secure */}
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-700">
                    <ShieldCheck size={22} />

                    <p className="text-sm font-medium">
                        Secure SSL encrypted checkout
                    </p>
                </div>

                {/* Button */}
                <button 
                    disabled={loading}
                    onClick={handlePlaceOrder}
                    className="mt-8 w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition-all hover:bg-gray-800">
                    {loading ? "Processing..." : "Complete Order"}
                </button>

                <p className="mt-4 text-center text-xs leading-6 text-gray-400">
                    Your payment information is processed securely. We do not store
                    credit card details.
                </p>
            </div>
            </div>
        </div>
        </div>
    );
}
