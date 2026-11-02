import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDashboard } from "../../redux/slice/adminDashboardSlice";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const STATUS_STYLES = {
    Delivered: "bg-green-50 text-green-800 border border-green-200",
    Processing: "bg-amber-50 text-amber-800 border border-amber-200",
    Packed: "bg-indigo-50 text-indigo-800 border border-indigo-200",
    Shipped: "bg-blue-50 text-blue-800 border border-blue-200",
    Cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { dashboardData, loading: isLoading, error } = useSelector(
        (state) => state.adminDashboard
    );

    useEffect(() => {
        dispatch(fetchAdminDashboard());
    }, [dispatch]);

    const totalOrders = dashboardData?.total_orders ?? 0;
    const totalProducts = dashboardData?.total_products ?? 0;
    const totalUsers = dashboardData?.total_users ?? 0;
    const totalRevenue = dashboardData?.total_revenue ?? 0;
    const recentOrders = dashboardData?.recent_orders ?? [];

    return (
        <div className="px-6 md:px-10 py-6">
            <div className="pb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Dashboard
                </h1>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
                    {error.message || "Failed to load dashboard data."}
                </div>
            )}

            {!isLoading && !error && (
                <div className="space-y-10">
                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-32 border border-gray-100">
                            <div className="text-gray-500 flex items-center gap-2 text-sm md:text-base">
                                <ShoppingCart size={20} className="text-blue-600" />
                                <p className="font-medium">Total Orders</p>
                            </div>
                            <h2 className="text-3xl font-bold text-black mt-3">
                                {totalOrders}
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-32 border border-gray-100">
                            <div className="text-gray-500 flex items-center gap-2 text-sm md:text-base">
                                <Package size={20} className="text-purple-600" />
                                <p className="font-medium">Products</p>
                            </div>
                            <h2 className="text-3xl font-bold text-black mt-3">
                                {totalProducts}
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-32 border border-gray-100">
                            <div className="text-gray-500 flex items-center gap-2 text-sm md:text-base">
                                <Users size={20} className="text-indigo-600" />
                                <p className="font-medium">Users</p>
                            </div>
                            <h2 className="text-3xl font-bold text-black mt-3">
                                {totalUsers}
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-32 border border-gray-100">
                            <div className="text-gray-500 flex items-center gap-2 text-sm md:text-base">
                                <TrendingUp size={20} className="text-green-600" />
                                <p className="font-medium">Revenue</p>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-black mt-3">
                                ₹{Number(totalRevenue).toLocaleString("en-IN")}
                            </h2>
                        </div>
                    </div>

                    {/* RECENT ORDERS */}
                    <div className="w-full p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Recent Orders
                            </h3>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                    <ShoppingCart size={26} className="text-gray-400" />
                                </div>
                                <p className="text-base font-medium text-gray-700">
                                    No recent orders
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Orders placed will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full mt-3 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-center">
                                            <th className="px-6 py-4 text-black font-bold text-left">
                                                ORDER NUMBER
                                            </th>
                                            <th className="px-8 py-4 text-black font-bold text-left">
                                                CUSTOMER
                                            </th>
                                            <th className="px-6 py-4 text-black font-bold text-center">
                                                ITEMS
                                            </th>
                                            <th className="px-6 py-4 text-black font-bold text-center">
                                                DATE
                                            </th>
                                            <th className="px-6 py-4 text-black font-bold text-center">
                                                TOTAL AMOUNT
                                            </th>
                                            <th className="px-6 py-4 text-black font-bold text-center">
                                                STATUS
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-50">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="shadow-sm text-center">
                                                <td className="px-6 py-4 text-left">
                                                    <span
                                                        className="font-mono font-bold text-gray-900"
                                                        title={order.order_number}
                                                    >
                                                        #{order.order_number ? String(order.order_number).slice(0, 8) : order.id}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                            {order.customer_name
                                                                ? order.customer_name.slice(0, 2).toUpperCase()
                                                                : "CU"}
                                                        </div>
                                                        <span className="font-semibold text-gray-800">
                                                            {order.customer_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                                    {order.items_count} item{order.items_count === 1 ? "" : "s"}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-600">
                                                    {order.created_at
                                                        ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                                              day: "2-digit",
                                                              month: "short",
                                                              year: "numeric",
                                                          })
                                                        : "—"}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-900">
                                                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center rounded-xl px-3 py-1 font-semibold text-xs border ${
                                                            STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800 border-gray-200"
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
