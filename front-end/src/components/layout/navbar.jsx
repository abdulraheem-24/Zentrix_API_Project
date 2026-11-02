import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Menu,
  X,
  Search,
  User,
  Signal,
} from "lucide-react";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { fetchSuggestions } from "../../services/products";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { isAuthenticated , user } = useSelector(state => state.auth);
  const { totalQuantity } = useSelector(state => state.cart);

  console.log(user)

  const navigate = useNavigate();


  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);


  // useEffect(() => {
  //   const getSuggestions = async () => {
  //     if (!debouncedSearch.trim()) {
  //       setSuggestions([]);
  //       return;
  //     }

  //     const data = await fetchSuggestions(debouncedSearch);
  //     setSuggestions(data);
  //   }

  //   getSuggestions();
  // },[debouncedSearch]);


  // useEffect(() => {
  //   console.log(suggestions);
  // },[suggestions])



  
  useEffect(() => {
    const controller = new AbortController();

    const getSuggestions = async () => {
      if (!debouncedSearch) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await fetchSuggestions(debouncedSearch, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setSuggestions(results);
        }
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          console.error("Suggestion fetch failed:", error);

          if (!controller.signal.aborted) {
            setSuggestions([]);
          }
        }
      }
    };

    getSuggestions();

    return () => controller.abort();
  }, [debouncedSearch]);



  
function handleSearchSubmit(event) {
  event?.preventDefault();

  const term = search.trim();

  if (!term) return;

  navigate(`/products?search=${encodeURIComponent(term)}`);
  setSuggestions([]);
  setMenuOpen(false);
}


  const { Logout} = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-18 items-center justify-between px-4 lg:px-6">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-20">
          
          {/* LOGO */}
          <h1 className="cursor-pointer text-2xl font-semibold tracking-tight text-gray-900">
            <span className="mr-px text-3xl italic font-bold">
              Z
            </span>
            entrix
          </h1>

          {/* DESKTOP LINKS */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to={"/"}
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Home
            </Link>

            <Link
              to={"/Products"}
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Products
            </Link>
          </div>
        </div>


        <div className="relative w-full max-w-xl">
          {/* SEARCH BAR */}
          <div className="hidden flex-1 justify-center px-6 md:flex">
              <form 
                onSubmit={handleSearchSubmit}
                className="flex w-full max-w-xl overflow-hidden rounded-xl border border-gray-300 bg-white">
                  
                  {/* Input Section */}
                  <div className="flex flex-1 items-center px-4">
                      <Search size={20} className="text-gray-500" />

                      <input
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          type="search"
                          placeholder="Search products..."
                          className="w-full px-3 py-3 text-sm outline-none placeholder:text-gray-400"
                      />
                  </div>

                  {/* Search Button */}
                  <button 
                    type="submit"
                    className="bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800">
                      Search
                  </button>
              </form>
          </div>



          {suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSearch(sug.name);
                    setSuggestions([]);

                    navigate(
                      `/products?search=${encodeURIComponent(sug.name)}&_page=1`
                    );
                  }}
                >
                  <img
                    src={sug.image}
                    alt={sug.name}
                    className="h-12 w-12 object-cover rounded-lg"
                  />

                  <p className="text-sm text-gray-700">
                    {sug.name}
                  </p>
                </div>
              ))}
            </div>
          )}


        </div>




        {/* RIGHT SIDE */}
        <div className="hidden items-center gap-7 md:flex">
          
          {/* WISHLIST */}
          <button className="transition hover:scale-105">
            <Heart className="h-5 w-5 text-gray-700" />
          </button>

          {/* CART */}
          <Link
            to={"/Cart"}>
            <button className="relative transition hover:scale-105">
              <ShoppingCart className="h-5 w-5 text-gray-700" />

              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                {totalQuantity}
              </span>
            </button>
          </Link>

          {/* orders */}
          <Link 
            to={"/orders"}>
            <div className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                Orders
            </div>
          </Link>

          {/* LOGIN */}
          {!isAuthenticated ? (
            <Link to={"/Login"}>
                <button className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                    <User size={18} className="text-white" />
                    Login
                </button>
            </Link>
          ) : (
            <Link to={"/Login"}>
              <button 
                className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                onClick={() => Logout()}>
                  <User size={18} className="text-white" />
                  Logout
              </button>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to={"/admin/adminDashboard"}>
              <button 
                className="flex items-center gap-2 rounded-[15px] bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Admin
              </button>
            </Link>
          )}
          
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-6 w-6 text-gray-800" />
          ) : (
            <Menu className="h-6 w-6 text-gray-800" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-5 md:hidden">
          
          {/* MOBILE SEARCH BAR */}
            <div className="mb-5 md:hidden">
                <div className="flex h-12.5 overflow-hidden rounded-xl border border-gray-300 bg-white">
                    
                    {/* INPUT */}
                    <div className="flex flex-1 items-center px-4">
                        <Search size={18} className="text-gray-400" />

                        <input
                          type="search"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full bg-transparent px-3 text-sm outline-none"
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="bg-black px-5 text-sm font-medium text-white"
                    >
                      Search
                    </button>
                </div>
            </div>

          {/* MOBILE LINKS */}
          <div className="flex flex-col gap-5">
            <Link
              to={"/"}
              className="text-sm font-medium text-gray-700"
            >
              Home
            </Link>

            <a
              href="#"
              className="text-sm font-medium text-gray-700"
            >
              Products
            </a>

            <button className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Heart size={18} />
              Wishlist
            </button>

            <button className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ShoppingCart size={18} />
              Cart
            </button>

            {!isAuthenticated ? (
              <Link to={"/Login"}>
                  <button className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                      <User size={18} className="text-white" />
                      Login
                  </button>
              </Link>
            ) : (
              <Link to={"/Login"}>
                <button 
                  className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  onClick={() => Logout()}>
                    <User size={18} className="text-white" />
                    Logout
                </button>
              </Link>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}