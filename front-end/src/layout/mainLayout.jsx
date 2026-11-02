import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../components/layout/footer";
import Navbar from "../components/layout/navbar";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import { toast } from "react-toastify";


export default function MainLayout () {

    const { user , Logout } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (user?.status === "blocked") {
            toast.error("Your Account has been blocked!");
            Logout();
            navigate("/Login");
        }
    },[]);

    


    return (
        <div>
            <Navbar/>
            <Outlet/>
            <Footer/>
        </div>
    )
}