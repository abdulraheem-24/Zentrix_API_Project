import api from "./api";

const normalizeParams = (params = {}) => {
    const { _page, ...rest } = params;
    delete rest._per_page;

    const normalized = {
        ...rest,
        ...(_page !== undefined && { page: _page }),
    };

    // Remove undefined or empty string values
    Object.keys(normalized).forEach((key) => {
        if (normalized[key] === undefined || normalized[key] === "") {
            delete normalized[key];
        }
    });

    return normalized;
};

export const adminServices = {
    // Categories
    fetchCategories: async () => {
        const response = await api.get("categories/");
        return response.data.results ?? response.data;
    },

    // Products
    fetchProduct: async (params) => {
        const response = await api.get("admin/products/", {
            params: normalizeParams(params),
        });

        return {
            data: response.data.results ?? response.data,
            totalItems: response.data.count ?? (Array.isArray(response.data) ? response.data.length : 0),
        };
    },

    addProducts: async (productData) => {
        const response = await api.post("admin/products/", productData);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await api.patch(`admin/products/${id}/`, productData);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`admin/products/${id}/`);
        return response.data;
    },

    // Orders
    fetchOrders: async (params) => {
        const response = await api.get("admin/orders/", {
            params: normalizeParams(params),
        });

        return {
            data: response.data.results ?? response.data,
            totalOrderItems: response.data.count ?? (Array.isArray(response.data) ? response.data.length : 0),
        };
    },

    updateOrders: async (id, editData) => {
        const response = await api.patch(
            `admin/orders/${id}/status/`,
            editData
        );
        return response.data;
    },

    cancelOrder: async (id) => {
        const response = await api.post(`admin/orders/${id}/cancel/`);
        return response.data;
    },

    // Users
    fetchUsers: async (params) => {
        const response = await api.get("auth/admin/users/", {
            params: normalizeParams(params),
        });

        return {
            data: response.data.results ?? response.data,
            totalUsers: response.data.count ?? (Array.isArray(response.data) ? response.data.length : 0),
        };
    },

    updateUsers: async (id, editUserData) => {
        const response = await api.patch(
            `auth/admin/users/${id}/status/`,
            editUserData
        );
        return response.data;
    },
};

export const adminDashboardServices = async () => {
    const response = await api.get("admin/dashboard/");
    return response.data;
};
