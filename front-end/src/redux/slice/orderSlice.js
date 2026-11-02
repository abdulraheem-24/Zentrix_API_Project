import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";



export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (orderData, thunkAPI) => {
    try {
      const { data } = await api.post("orders/", orderData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          detail: error.message || "Unable to place order",
        },
      );
    }
  },
);


export const cancelOrderRequest = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, thunkAPI) => {
    try {
      const { data } = await api.post(
        `orders/${orderId}/cancel/`,
      );
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          detail: error.message || "Unable to cancel order",
        },
      );
    }
  },
);


const initialState = {
  loading: false,
  success: false,
  error: null,
  orders: [],
};


const orderSlice = createSlice({
    name : "order",
    initialState,
    
    
    reducers: {
        resetOrderState: (state) => {
        state.loading = false;
        state.success = false;
        state.error = null;
        },
    },


    extraReducers: (builder) => {
        builder
            .addCase(placeOrder.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.orders.unshift(action.payload);
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(cancelOrderRequest.fulfilled, (state, action) => {
                const updatedOrder = action.payload;

                state.orders = state.orders.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order,
                );
            });
    },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;