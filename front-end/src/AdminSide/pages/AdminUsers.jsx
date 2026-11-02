import { Shield, ShieldAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminUsers,
    updateAdminUsers,
} from "../../redux/slice/adminUsersSlice";

export default function AdminUsers() {
    const [page, setPage] = useState(1);
    const [searchUsers, setSearchUsers] = useState("");

    const dispatch = useDispatch();

    const {
        users,
        fetchUsersLoading: isLoading,
        updateUsersLoading,
        error,
        totalUsers,
    } = useSelector((state) => state.adminUsers);

    useEffect(() => {
        dispatch(
            fetchAdminUsers({
                page: page,
                search: searchUsers.trim() || undefined,
            })
        );
    }, [page, searchUsers, dispatch]);

    const PAGE_SIZE = 12;
    const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

    const filterdUsers = users.filter((user) => {
        const query = searchUsers.trim().toLowerCase();
        if (!query) return true;
        const usernameMatch = user.username?.toLowerCase().includes(query);
        const emailMatch = user.email?.toLowerCase().includes(query);
        return usernameMatch || emailMatch;
    });

    async function handleChangeUserStatus(e, user) {
        e.preventDefault();
        const actionLabel = user.is_active ? "block" : "unblock";
        const confirmed = window.confirm(
            `Are you sure you want to ${actionLabel} ${user.username}?`
        );
        if (confirmed) {
            await dispatch(
                updateAdminUsers({
                    id: user.id,
                    editData: { is_active: !user.is_active },
                })
            );
        }
    }

    return (
        <div className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
                <h1 className="text-3xl font-bold">Users</h1>

                <div className="flex flex-1 max-w-md w-full">
                    <input
                        value={searchUsers}
                        onChange={(e) => {
                            setSearchUsers(e.target.value);
                            setPage(1);
                        }}
                        type="search"
                        placeholder="Search users by name or email..."
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
                    {error.message || "Failed to load users."}
                </div>
            )}

            {!isLoading && !error && filterdUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <Users size={26} className="text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-700">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchUsers ? "Try another search term." : "Registered users will appear here."}
                    </p>
                </div>
            )}

            {!isLoading && !error && filterdUsers.length > 0 && (
                <div className="w-full p-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-center">
                                <th className="px-8 py-3.5 text-black font-bold text-left">NAME</th>
                                <th className="px-8 py-3.5 text-black font-bold text-left">EMAIL</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">ROLE</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">JOINED</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">STATUS</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {filterdUsers.map((user) => {
                                const isAdmin = user.role === "admin";

                                return (
                                    <tr key={user.id} className="shadow-sm text-center">
                                        <td className="text-left px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                    {user.username?.slice(0, 1).toUpperCase() || "U"}
                                                </div>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {user.username}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="text-left px-4 py-3.5">
                                            <span className="text-gray-600 text-sm">
                                                {user.email}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex justify-center">
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                        isAdmin
                                                            ? "text-purple-700 bg-purple-100 border border-purple-200"
                                                            : "text-gray-800 bg-gray-100 border border-gray-200"
                                                    }`}
                                                >
                                                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center text-gray-500">
                                            {user.date_joined
                                                ? new Date(user.date_joined).toLocaleDateString("en-IN", {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                  })
                                                : "—"}
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex justify-center">
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                                                        user.is_active
                                                            ? "text-green-800 bg-green-50 border-green-200"
                                                            : "text-red-800 bg-red-50 border-red-200"
                                                    }`}
                                                >
                                                    {user.is_active ? "Active" : "Blocked"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex justify-center">
                                                {!isAdmin ? (
                                                    <button
                                                        onClick={(e) => handleChangeUserStatus(e, user)}
                                                        disabled={updateUsersLoading}
                                                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                                                            !user.is_active
                                                                ? "text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                                                                : "text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                                                        }`}
                                                    >
                                                        {!user.is_active ? (
                                                            <>
                                                                <Shield size={14} />
                                                                Unblock
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldAlert size={14} />
                                                                Block
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        Admin user
                                                    </span>
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
