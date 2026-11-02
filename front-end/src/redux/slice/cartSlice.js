
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: null,
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    loading: false,
    error: null,
};

function mapCart(cart) {
    return {
        id: cart.id,
        items: cart.items || [],
        totalQuantity: cart.total_quantity || 0,
        totalAmount: Number(cart.subtotal || 0),
    };
}

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        setCart: (state, action) => {
        return {
            ...state,
            ...mapCart(action.payload),
            loading: false,
            error: null,
        };
        },

        setCartLoading: (state, action) => {
        state.loading = action.payload;
        },

        setCartError: (state, action) => {
        state.loading = false;
        state.error = action.payload;
        },

        clearCartState: () => initialState,
    },
});

export const {
    setCart,
    setCartLoading,
    setCartError,
    clearCartState,
} = cartSlice.actions;

export default cartSlice.reducer;
