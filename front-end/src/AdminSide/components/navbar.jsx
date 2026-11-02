import { Link } from "react-router-dom";


export default function AdminNavbar() {


    return (
        <header className="w-full h-16 bg-white sticky top-0 z-20 flex justify-between
                        items-center px-4 md:px-6 border-b border-green-100 shadow-sm">

            <h1 className="cursor-pointer text-xl md:text-2xl font-semibold tracking-tight text-gray-900 leading-none">
                <span className="text-2xl md:text-3xl font-bold">Admin</span>
                <span className="text-blue-600 text-2xl md:text-3xl font-bold ml-1">Panel</span>
            </h1>

            <Link to={"/"}>
              <button 
                className="flex items-center gap-2 rounded-[15px] bg-black px-6 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Clint side 
              </button>
            </Link>
            
        </header>
    );
}