import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminServices } from "../../services/adminServices";
import { toast } from "react-toastify";

const formatErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (!data) return error.message || fallback;
    if (typeof data === "string") return data;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data === "object") {
        const parts = Object.entries(data).map(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
            return `${field}: ${msg}`;
        });
        if (parts.length > 0) return parts.join(" | ");
    }
    return fallback;
};

export const fetchAdminUsers = createAsyncThunk(
    "adminUsers/fetchAdminUsers",
    async (params, thunkAPI) => {
        try {
            const data = await adminServices.fetchUsers(params);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: formatErrorMessage(error, "Failed to load users."),
                data: error.response?.data,
            });
        }
    }
);

export const updateAdminUsers = createAsyncThunk(
    "adminUsers/updateAdminUsers",
    async ({ id, editData }, thunkAPI) => {
        try {
            const data = await adminServices.updateUsers(id, editData);
            const statusLabel = data.is_active ? "activated" : "blocked";
            toast.success(`User ${statusLabel} successfully`);
            return data;
        } catch (error) {
            const message = formatErrorMessage(error, "Failed to update user status");
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message,
                data: error.response?.data,
            });
        }
    }
);

const initialState = {
    users: [],
    totalUsers: 0,

    fetchUsersLoading: false,
    updateUsersLoading: false,

    error: null,
};

const adminUserSlice = createSlice({
    name: "adminUsers",
    initialState,
    reducers: {
        clearUserErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchAdminUsers.pending, (state) => {
                state.fetchUsersLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.fetchUsersLoading = false;
                state.users = action.payload.data;
                state.totalUsers = action.payload.totalUsers;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.fetchUsersLoading = false;
                state.error = action.payload;
            })

            // Update Users
            .addCase(updateAdminUsers.pending, (state) => {
                state.updateUsersLoading = true;
                state.error = null;
            })
            .addCase(updateAdminUsers.fulfilled, (state, action) => {
                state.updateUsersLoading = false;
                const index = state.users.findIndex(
                    (user) => user.id === action.payload.id
                );
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateAdminUsers.rejected, (state, action) => {
                state.updateUsersLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserErrors } = adminUserSlice.actions;
export default adminUserSlice.reducer;
