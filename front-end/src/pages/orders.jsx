
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    Clock3,
    Package,
    Truck,
    CheckCircle2,
    ShoppingBag,
    MapPin,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import { cancelOrderRequest } from "../redux/slice/orderSlice";
import useOrders from "../hooks/useOrders";

const STEPS = [
    { label: "Placed", icon: Clock3 },
    { label: "Packed", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 },
];

const STATUS_STYLES = {
    Processing: "bg-amber-100 text-amber-800",
    Packed: "bg-purple-100 text-purple-800",
    Shipped: "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_STYLES = {
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-blue-100 text-blue-800",
};

function money(value) {
    return Number(value ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function StatusBadge({ status }) {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
        }`}>
            {status}
        </span>
    );
}

function PaymentBadge({ status }) {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            PAYMENT_STYLES[status] || "bg-gray-100 text-gray-700"
        }`}>
            Payment: {status}
        </span>
    );
}

function ProductRow({ item, navigate }) {
    const productId = item.product;

    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">

            {item.product_image ? (
                <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                />
            ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Package className="text-gray-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                    {item.product_name}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                    {item.product_brand}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                    Qty: {item.quantity} × ₹{money(item.unit_price)}
                </p>

                {productId && (
                    <button
                        onClick={() => navigate(`/products/${productId}`)}
                        className="text-xs text-blue-600 mt-2 hover:underline"
                    >
                        View product
                    </button>
                )}
            </div>

            <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                    ₹{money(item.line_total)}
                </p>
            </div>

        </div>
    );
}

function ProgressTracker({ status }) {
    if (status === "Cancelled") {
        return (
            <div className="mt-5 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
                This order has been cancelled.
            </div>
        );
    }

    const currentIndex = STEPS.findIndex(
        step => step.label === status
    );

    return (
        <div className="mt-6">

            <div className="flex items-center justify-between relative">

                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const completed = index <= currentIndex;

                    return (
                        <div
                            key={step.label}
                            className="flex flex-col items-center flex-1 relative"
                        >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                completed
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-400"
                            }`}>
                                <Icon size={16} />
                            </div>

                            <span className={`text-xs mt-2 ${
                                completed
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-400"
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

function OrderCard({ order, navigate, onCancel, cancelling }) {
    const [expanded, setExpanded] = useState(false);

    const isCancelled = order.status === "Cancelled";

    const canCancel =
        order.status === "Processing" &&
        ["pending", "failed"].includes(order.payment_status);

    const orderDate = new Date(order.created_at).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

    const paymentMethod = {
        cod: "Cash on Delivery",
        upi: "UPI",
        card: "Card",
    }[order.payment_method] || order.payment_method;

    const items = Array.isArray(order.items) ? order.items : [];

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6">

            {/* Order header */}

            <div className="flex justify-between items-start flex-wrap gap-3">

                <div>
                    <h2 className="font-semibold text-gray-900">
                        Order #{order.id}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                        {orderDate}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        {items.length} product item(s)
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.status} />
                    <PaymentBadge status={order.payment_status} />
                </div>

            </div>

            <hr className="my-5 border-gray-100" />

            {/* All products in this order */}

            <h3 className="font-semibold text-sm mb-2">
                Ordered Products
            </h3>

            <div>
                {items.length > 0 ? (
                    items.map(item => (
                        <ProductRow
                            key={item.id}
                            item={item}
                            navigate={navigate}
                        />
                    ))
                ) : (
                    <p className="text-sm text-gray-500">
                        No product items found for this order.
                    </p>
                )}
            </div>

            <hr className="my-5 border-gray-100" />

            {/* Shipping information */}

            <div className="flex flex-col md:flex-row justify-between gap-5">

                <div className="flex-1">

                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-gray-500" />
                        <h3 className="font-semibold text-sm">
                            Shipping Address
                        </h3>
                    </div>

                    <p className="text-sm text-gray-700">
                        {order.customer_name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        {order.shipping_address}
                    </p>

                    <p className="text-sm text-gray-500">
                        {order.shipping_city},{" "}
                        {order.shipping_district},{" "}
                        {order.shipping_state} -{" "}
                        {order.shipping_postal_code}
                    </p>

                    <p className="text-sm text-gray-500">
                        {order.shipping_country}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Phone: {order.customer_phone}
                    </p>

                </div>

                {/* Payment summary */}

                <div className="w-full md:max-w-xs space-y-2">

                    <h3 className="font-semibold text-sm mb-3">
                        Order Summary
                    </h3>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{money(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span>- ₹{money(order.discount_amount)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span>₹{money(order.shipping_charge)}</span>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{money(order.total_amount)}</span>
                    </div>

                    <p className="text-xs text-gray-500">
                        Payment method: {paymentMethod}
                    </p>

                </div>

            </div>

            <hr className="my-5 border-gray-100" />

            {/* Order tracking */}

            <div className="flex justify-between items-center gap-3">
                <h3 className="font-semibold text-sm">
                    Order Status
                </h3>

                <StatusBadge status={order.status} />
            </div>

            <ProgressTracker status={order.status} />

            {expanded && (
                <div className="mt-5 bg-gray-50 rounded-xl p-4">

                    <h3 className="font-semibold text-sm mb-3">
                        Order Details
                    </h3>

                    <p className="text-xs text-gray-500 mb-2">
                        Order number: {order.order_number}
                    </p>

                    <p className="text-xs text-gray-500 mb-2">
                        Last updated: {new Date(
                            order.updated_at
                        ).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-gray-500">
                        {isCancelled
                            ? "This order is no longer active."
                            : `Your current order status is ${order.status}.`
                        }
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                        Actual courier tracking will be available
                        after shipping integration.
                    </p>

                </div>
            )}

            <hr className="my-5 border-gray-100" />

            {/* Actions */}

            <div className="flex flex-col sm:flex-row gap-3">

                {canCancel && (
                    <button
                        disabled={cancelling}
                        onClick={() => onCancel(order)}
                        className="flex-1 border border-red-200 text-red-600 rounded-xl py-3 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
                        {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                )}

                <button
                    onClick={() => setExpanded(value => !value)}
                    className="flex-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 flex justify-center items-center gap-2"
                >
                    {expanded ? "Hide Details" : "View Order Details"}
                    {expanded
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />
                    }
                </button>

            </div>

        </div>
    );
}

export default function OrdersPage() {

    const { data, isLoading, error } = useOrders();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [cancellingId, setCancellingId] = useState(null);

    const orders = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
            ? data.results
            : [];

    async function handleCancelOrder(order) {

        const confirmed = window.confirm(
            `Are you sure you want to cancel order #${order.id}?`
        );

        if (!confirmed) return;

        try {
            setCancellingId(order.id);

            await dispatch(
                cancelOrderRequest(order.id)
            ).unwrap();

            // Refresh the React Query data used by this page.
            await queryClient.invalidateQueries({
                queryKey: ["orders"],
            });

            toast.success("Order cancelled successfully.");

        } catch (error) {

            const message =
                error?.detail ||
                error?.status?.[0] ||
                error?.payment_status?.[0] ||
                "Unable to cancel this order.";

            toast.error(message);

        } finally {
            setCancellingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-10 text-center">
                Loading your orders...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-10 text-center text-red-600">
                {error.message || "Unable to load orders."}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="max-w-5xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        My Orders
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        View your purchases, payments and delivery status.
                    </p>
                </div>

                {orders.length === 0 ? (

                    <div className="bg-white rounded-2xl p-12 text-center">

                        <ShoppingBag
                            size={40}
                            className="mx-auto text-gray-400 mb-4"
                        />

                        <h2 className="font-semibold text-gray-800">
                            No orders yet
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Your orders will appear here after checkout.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="mt-5 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm"
                        >
                            Explore Products
                        </button>

                    </div>

                ) : (

                    orders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            navigate={navigate}
                            onCancel={handleCancelOrder}
                            cancelling={cancellingId === order.id}
                        />
                    ))

                )}

            </div>

        </div>
    );
}
