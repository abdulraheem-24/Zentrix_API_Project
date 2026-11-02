import { useEffect, useState } from "react";
import { Ban, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    cancelAdminOrder,
    fetchAdminOrders,
    updateAdminOrders,
} from "../../redux/slice/adminOrdersSlice";

const ALLOWED_TRANSITIONS = {
    Processing: ["Packed"],
    Packed: ["Shipped"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
};

const STATUS_STYLES = {
    Delivered: "bg-green-50 text-green-800 border border-green-200",
    Processing: "bg-amber-50 text-amber-800 border border-amber-200",
    Packed: "bg-indigo-50 text-indigo-800 border border-indigo-200",
    Shipped: "bg-blue-50 text-blue-800 border border-blue-200",
    Cancelled: "bg-red-50 text-red-700 border border-red-200",
};

const PAYMENT_STATUS_STYLES = {
    paid: "text-green-700 bg-green-50 border-green-200",
    pending: "text-amber-700 bg-amber-50 border-amber-200",
    failed: "text-red-700 bg-red-50 border-red-200",
    refunded: "text-purple-700 bg-purple-50 border-purple-200",
};

export default function AdminOrders() {
    const [page, setPage] = useState(1);
    const [searchOrders, setSearchOrders] = useState("");

    const dispatch = useDispatch();

    const {
        orders,
        fetchOrderLoading: isLoading,
        updateOrderLoading,
        cancelOrderLoading,
        error,
        totalOrderItems,
    } = useSelector((state) => state.adminOrders);

    useEffect(() => {
        dispatch(
            fetchAdminOrders({
                page: page,
                search: searchOrders.trim() || undefined,
            })
        );
    }, [page, searchOrders, dispatch]);

    const PAGE_SIZE = 12;
    const totalPages = Math.max(1, Math.ceil(totalOrderItems / PAGE_SIZE));

    const filterdOrders = orders.filter((order) => {
        const query = searchOrders.trim().toLowerCase();
        if (!query) return true;
        const matchesName = order.customer_name?.toLowerCase().includes(query);
        const matchesOrderNumber = String(order.order_number || "").toLowerCase().includes(query);
        const matchesEmail = order.customer_email?.toLowerCase().includes(query);
        const matchesDate = order.created_at ? order.created_at.slice(0, 10).includes(query) : false;
        return matchesName || matchesOrderNumber || matchesEmail || matchesDate;
    });

    async function handleChangeStatus(e, order) {
        const newStatus = e.target.value;
        if (!newStatus || newStatus === order.status) return;

        await dispatch(
            updateAdminOrders({
                id: order.id,
                editData: {
                    status: newStatus,
                },
            })
        );
    }

    async function handleCancelOrder(e, order) {
        e.preventDefault();
        const confirmed = window.confirm(
            `Are you sure you want to cancel order #${order.order_number?.slice(0, 8)}? Stock will be restored.`
        );
        if (confirmed) {
            await dispatch(cancelAdminOrder(order.id));
        }
    }

    return (
        <div className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
                <h1 className="text-3xl font-bold">Orders</h1>

                <div className="flex flex-1 max-w-md w-full">
                    <input
                        value={searchOrders}
                        onChange={(e) => {
                            setSearchOrders(e.target.value);
                            setPage(1);
                        }}
                        type="search"
                        placeholder="Search by customer name, order number, date..."
                        className="w-full border border-gray-400 rounded-2xl px-5 py-3 outline-none focus:border-black"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                    {error.message || "Failed to load orders."}
                </div>
            )}

            {!isLoading && !error && filterdOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <ShoppingCart size={26} className="text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-700">
                        No orders found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchOrders ? "Try another search term." : "Orders placed by customers will appear here."}
                    </p>
                </div>
            )}

            {!isLoading && !error && filterdOrders.length > 0 && (
                <div className="w-full p-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-center">
                                <th className="px-5 py-3.5 text-black font-bold text-left">
                                    ORDER NUMBER
                                </th>
                                <th className="px-8 py-3.5 text-black font-bold text-left">
                                    CUSTOMER
                                </th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">
                                    ITEMS
                                </th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">
                                    DATE
                                </th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">
                                    PAYMENT
                                </th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">
                                    TOTAL AMOUNT
                                </th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">
                                    STATUS
                                </th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {filterdOrders.map((order) => {
                                const nextAllowed = ALLOWED_TRANSITIONS[order.status] || [];
                                const isTerminal = ["Delivered", "Cancelled"].includes(order.status);
                                const canCancel =
                                    ["Processing", "Packed"].includes(order.status) &&
                                    ["pending", "failed"].includes(order.payment_status);

                                return (
                                    <tr key={order.id} className="shadow-sm text-center">
                                        <td className="px-4 py-3.5 text-left">
                                            <div className="flex flex-col">
                                                <span
                                                    className="font-mono font-bold text-gray-900 cursor-pointer"
                                                    title={order.order_number}
                                                >
                                                    #{order.order_number ? String(order.order_number).slice(0, 8) : order.id}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    ID: {order.id}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                    {order.customer_name
                                                        ? order.customer_name.slice(0, 2).toUpperCase()
                                                        : "CU"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        {order.customer_name || "Guest"}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {order.customer_email || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center text-gray-700 font-medium">
                                            {order.items?.length ?? 0} item{order.items?.length === 1 ? "" : "s"}
                                        </td>

                                        <td className="px-4 py-3.5 text-center text-gray-600">
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                  })
                                                : "—"}
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[11px] font-bold uppercase text-gray-800">
                                                    {order.payment_method || "COD"}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                        PAYMENT_STATUS_STYLES[order.payment_status] || "bg-gray-100 text-gray-600 border-gray-200"
                                                    }`}
                                                >
                                                    {order.payment_status || "pending"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                                            ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <div
                                                className={`inline-flex items-center justify-center rounded-xl px-3 py-1 font-semibold text-xs ${
                                                    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {order.status}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Status Transition Selector */}
                                                <select
                                                    className={`py-1.5 px-2.5 rounded-lg border border-gray-300 text-xs shadow-sm outline-none transition focus:border-blue-500 bg-white ${
                                                        isTerminal ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"
                                                    }`}
                                                    value={order.status}
                                                    onChange={(e) => handleChangeStatus(e, order)}
                                                    disabled={isTerminal || updateOrderLoading}
                                                >
                                                    <option value={order.status}>
                                                        {order.status}
                                                    </option>
                                                    {nextAllowed.map((statusOption) => (
                                                        <option key={statusOption} value={statusOption}>
                                                            Advance to: {statusOption}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Cancel Order Action */}
                                                {canCancel && (
                                                    <button
                                                        onClick={(e) => handleCancelOrder(e, order)}
                                                        disabled={cancelOrderLoading}
                                                        title="Cancel Order"
                                                        className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                                                    >
                                                        <Ban size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-center gap-5 mt-8 mb-4">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-medium text-xs cursor-pointer"
                        >
                            Prev
                        </button>

                        <span className="font-medium text-xs text-gray-700">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-medium text-xs cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
