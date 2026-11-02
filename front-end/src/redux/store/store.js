import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import cartReducer from "../slice/cartSlice";
import orderReducer from "../slice/orderSlice";
import adminProductsReducer from "../slice/adminProductsSlice";
import adminOrdersReducer from "../slice/adminOrdersSlice";
import adminUsersReducer from "../slice/adminUsersSlice";
import adminDashboardReducer from "../slice/adminDashboardSlice";

const Logger = () => next => action => {
    const result = next(action);
    return result;
}

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
        adminProducts: adminProductsReducer,
        adminOrders: adminOrdersReducer,
        adminUsers: adminUsersReducer,
        adminDashboard: adminDashboardReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(Logger)
});
