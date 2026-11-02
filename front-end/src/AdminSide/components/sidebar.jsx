import { LayoutDashboard, LogOut, Package, ShoppingCart, Users } from "lucide-react";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { NavLink, useNavigate } from "react-router-dom";

export default function SideBar () {
    const user = useSelector(state => state.auth.user);
    const { Logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            name : "Dashboard",
            path : "/admin/adminDashboard",
            icon : LayoutDashboard
        },
        {
            name : "Products",
            path :  "/admin/adminProducts",
            icon : Package
        },
        {
            name : "Orders",
            path :  "/admin/adminOrders",
            icon : ShoppingCart
        },
        {
            name : "Users",
            path :  "/admin/adminUsers",
            icon : Users
        }
    ];

    function handleLogout (e) {
        e.preventDefault();
        Logout();
        navigate('/Login');
    }

    return (
        <div className=" w-60 shrink-0 max-h-screen bg-slate-900 sticky top-0">
            <div>
                <div className="px-8 py-5 w-full">
                    <h1 className="w-full cursor-pointer text-2xl font-semibold tracking-tight text-white">
                        <span className="mr-px text-3xl italic font-bold">
                        Z
                        </span>
                        entrix
                    </h1>
                </div>
                <div className="px-5 py-5 w-full">
                    <ul>
                        {menuItems.map((item , i) => (
                            <li key={i}>
                                <NavLink 
                                    to={item.path}
                                    className={({ isActive }) => 
                                        `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white 
                                        ${ isActive 
                                            ? "bg-blue-500" 
                                            : "bg- text-black"
                                        } `
                                    }>
                                    <item.icon className="w-5 h-5" />

                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="absolute bottom-3 w-full h-24 px-5 grid gap-2">
                    <hr className="text-gray-800 "/>
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center font-bold 
                                        rounded-full text-[12px] bg-gray-600 text-blue-400 shrink-0">
                            {user?.username?.slice(0,1).toUpperCase()}
                        </div>
                        <div className="">
                            <p className="text-white text-[14px]">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="flex gap-3 text-red-500 border-white rounded-2xl items-center font-bold px-2 cursor-pointer">
                            <LogOut size={15}/>
                            <span className="text-[15px]">
                                Logout
                            </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
