import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminDashboardServices } from "../../services/adminServices";

export const fetchAdminDashboard = createAsyncThunk(
    "adminDashboard/fetchAdminDashboard",
    async (_, thunkAPI) => {
        try {
            const data = await adminDashboardServices();
            return data;
        } catch (error) {
            const errData = error.response?.data;
            let message = "Failed to fetch dashboard data.";
            if (typeof errData?.detail === "string") {
                message = errData.detail;
            } else if (typeof errData === "string") {
                message = errData;
            } else if (error.message) {
                message = error.message;
            }
            return thunkAPI.rejectWithValue({ message, data: errData });
        }
    }
);

const initialState = {
    dashboardData: {
        total_orders: 0,
        total_products: 0,
        total_users: 0,
        total_revenue: 0,
        recent_orders: [],
    },
    loading: false,
    error: null,
};

const adminDashboardSlice = createSlice({
    name: "adminDashboard",
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardData = {
                    total_orders: action.payload.total_orders ?? 0,
                    total_products: action.payload.total_products ?? 0,
                    total_users: action.payload.total_users ?? 0,
                    total_revenue: action.payload.total_revenue ?? 0,
                    recent_orders: action.payload.recent_orders ?? [],
                };
            })
            .addCase(fetchAdminDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDashboardError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;

