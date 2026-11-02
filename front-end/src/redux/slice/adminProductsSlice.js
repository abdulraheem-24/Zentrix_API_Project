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

export const fetchAdminCategories = createAsyncThunk(
    "adminProducts/fetchAdminCategories",
    async (_, thunkAPI) => {
        try {
            const data = await adminServices.fetchCategories();
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: formatErrorMessage(error, "Failed to load categories."),
                data: error.response?.data,
            });
        }
    }
);

export const fetchAdminProducts = createAsyncThunk(
    "adminProducts/fetchAdminProducts",
    async (params, thunkAPI) => {
        try {
            const data = await adminServices.fetchProduct(params);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: formatErrorMessage(error, "Failed to load products."),
                data: error.response?.data,
            });
        }
    }
);

export const addAdminProduct = createAsyncThunk(
    "adminProducts/addAdminProduct",
    async (productData, thunkAPI) => {
        try {
            const data = await adminServices.addProducts(productData);
            toast.success("Product added successfully");
            return data;
        } catch (error) {
            const message = formatErrorMessage(error, "Failed to add Product");
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message,
                data: error.response?.data,
            });
        }
    }
);

export const updateAdminProduct = createAsyncThunk(
    "adminProducts/updateAdminProduct",
    async ({ id, productData }, thunkAPI) => {
        try {
            const data = await adminServices.updateProduct(id, productData);
            toast.success("Product updated successfully");
            return data;
        } catch (error) {
            const message = formatErrorMessage(error, "Failed to update Product");
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message,
                data: error.response?.data,
            });
        }
    }
);

export const deleteAdminProduct = createAsyncThunk(
    "adminProducts/deleteAdminProduct",
    async (id, thunkAPI) => {
        try {
            await adminServices.deleteProduct(id);
            toast.success("Product deactivated successfully");
            return id;
        } catch (error) {
            const message = formatErrorMessage(error, "Failed to deactivate Product");
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message,
                data: error.response?.data,
            });
        }
    }
);

const initialState = {
    products: [],
    categories: [],
    totalItems: 0,

    fetchLoading: false,
    categoriesLoading: false,
    addLoading: false,
    updateLoading: false,
    deleteLoading: false,

    error: null,
};

const adminProductSlice = createSlice({
    name: "adminProducts",
    initialState,
    reducers: {
        clearProductErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchAdminCategories.pending, (state) => {
                state.categoriesLoading = true;
            })
            .addCase(fetchAdminCategories.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchAdminCategories.rejected, (state) => {
                state.categoriesLoading = false;
            })

            // Fetch Products
            .addCase(fetchAdminProducts.pending, (state) => {
                state.fetchLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminProducts.fulfilled, (state, action) => {
                state.fetchLoading = false;
                state.products = action.payload.data;
                state.totalItems = action.payload.totalItems;
            })
            .addCase(fetchAdminProducts.rejected, (state, action) => {
                state.fetchLoading = false;
                state.error = action.payload;
            })

            // Add Product
            .addCase(addAdminProduct.pending, (state) => {
                state.addLoading = true;
                state.error = null;
            })
            .addCase(addAdminProduct.fulfilled, (state, action) => {
                state.addLoading = false;
                state.products.unshift(action.payload);
                state.totalItems += 1;
            })
            .addCase(addAdminProduct.rejected, (state, action) => {
                state.addLoading = false;
                state.error = action.payload;
            })

            // Update Product
            .addCase(updateAdminProduct.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateAdminProduct.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.products.findIndex(
                    (product) => product.id === action.payload.id
                );
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateAdminProduct.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete (Deactivate) Product
            .addCase(deleteAdminProduct.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteAdminProduct.fulfilled, (state, action) => {
                state.deleteLoading = false;
                const index = state.products.findIndex(
                    (product) => product.id === action.payload
                );
                if (index !== -1) {
                    state.products[index].is_active = false;
                }
            })
            .addCase(deleteAdminProduct.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProductErrors } = adminProductSlice.actions;
export default adminProductSlice.reducer;
