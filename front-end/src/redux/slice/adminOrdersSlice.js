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

export const fetchAdminOrders = createAsyncThunk(
    "adminOrders/fetchAdminOrders",
    async (params, thunkAPI) => {
        try {
            const data = await adminServices.fetchOrders(params);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: formatErrorMessage(error, "Failed to load orders."),
                data: error.response?.data,
            });
        }
    }
);

export const updateAdminOrders = createAsyncThunk(
    "adminOrders/updateAdminOrders",
    async ({ id, editData }, thunkAPI) => {
        try {
            const data = await adminServices.updateOrders(id, editData);
            toast.success("Order status updated successfully");
            return data;
        } catch (error) {
            const message = formatErrorMessage(error, "Failed to update order status");
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message,
                data: error.response?.data,
            });
        }
    }
);

export const cancelAdminOrder = createAsyncThunk(
    "adminOrders/cancelAdminOrder",
    async (id, thunkAPI) => {
        try {
            const data = await adminServices.cancelOrder(id);
            toast.success("Order cancelled successfully");
            return data;
        } catch (error) {
            const message = formatErrorMessage(error, "Failed to cancel order");
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message,
                data: error.response?.data,
            });
        }
    }
);

const initialState = {
    orders: [],
    totalOrderItems: 0,

    fetchOrderLoading: false,
    updateOrderLoading: false,
    cancelOrderLoading: false,

    error: null,
};

const adminOrderSlice = createSlice({
    name: "adminOrders",
    initialState,
    reducers: {
        clearOrderErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders
            .addCase(fetchAdminOrders.pending, (state) => {
                state.fetchOrderLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.fetchOrderLoading = false;
                state.orders = action.payload.data;
                state.totalOrderItems = action.payload.totalOrderItems;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.fetchOrderLoading = false;
                state.error = action.payload;
            })

            // Update Orders
            .addCase(updateAdminOrders.pending, (state) => {
                state.updateOrderLoading = true;
                state.error = null;
            })
            .addCase(updateAdminOrders.fulfilled, (state, action) => {
                state.updateOrderLoading = false;
                const index = state.orders.findIndex(
                    (order) => order.id === action.payload.id
                );
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(updateAdminOrders.rejected, (state, action) => {
                state.updateOrderLoading = false;
                state.error = action.payload;
            })

            // Cancel Order
            .addCase(cancelAdminOrder.pending, (state) => {
                state.cancelOrderLoading = true;
                state.error = null;
            })
            .addCase(cancelAdminOrder.fulfilled, (state, action) => {
                state.cancelOrderLoading = false;
                const index = state.orders.findIndex(
                    (order) => order.id === action.payload.id
                );
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(cancelAdminOrder.rejected, (state, action) => {
                state.cancelOrderLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearOrderErrors } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
