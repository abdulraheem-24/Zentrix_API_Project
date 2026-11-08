import { Route, Routes, useNavigate } from "react-router-dom";
import MainLayout from "../layout/mainLayout";
import Home from "../pages/Home";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register"
import Products from "../pages/Products";
import CartPage from "../pages/cart";
import ProductPage from "../pages/productDetails";
import ProtectedRoute from "./ProtectedRoute";
import CheckoutPage from "../pages/checkout";
import OrderSuccess from "../pages/orderSuccess";
import OrdersPage from "../pages/orders";
import AdminLayout from "../layout/adminLayout";
import AdminProducts from "../AdminSide/pages/AdminProducts";
import AdminOrders from "../AdminSide/pages/AdminOrders";
import AdminDashboard from "../AdminSide/pages/AdminDashboard";
import AdminUsers from "../AdminSide/pages/AdminUsers";
import useAuth from "../hooks/useAuth";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyOTP from "../pages/VerifyOTP";
import ResetPassword from "../pages/ResetPassword";
import { useEffect } from "react";
import { toast } from "react-toastify";


export default function AppRouter () {



    const { user , Logout } = useAuth();
    const navigate = useNavigate();


    


    return (
        <div>
            <Routes>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="Login" element={<LoginPage/>}/>
                    <Route path="Register" element={<RegisterPage/>}/>
                    <Route path="Products" element={<Products/>}/>
                    <Route path="/products/:id" element={<ProductPage/>}/>
                    

                    <Route element={<ProtectedRoute/>}>
                        <Route path="Cart" element={<CartPage/>}/>
                        <Route path="checkout" element={<CheckoutPage/>}/>
                        <Route path="orders" element={<OrdersPage/>}/>
                    </Route>

                    <Route path="orderSuccess" element={<OrderSuccess/>}/>


                    <Route path="forgot-password" element={<ForgotPassword />}/>
                    <Route path="verify-otp" element={<VerifyOTP />}/>
                    <Route path="reset-password"element={<ResetPassword />}/>
                
                </Route>

                <Route path="admin" element={<AdminLayout/>}>
                    <Route path="adminDashboard" element={<AdminDashboard/>}/>
                    <Route path="adminProducts" element={<AdminProducts/>}/>
                    <Route path="adminOrders" element={<AdminOrders/>}/>
                    <Route path="adminUsers" element={<AdminUsers/>}/>
                </Route>

                
            </Routes>
        </div>
    )
}