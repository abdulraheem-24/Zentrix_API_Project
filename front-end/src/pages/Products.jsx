import { 
    ChevronDown,Fullscreen,SlidersHorizontal, 
} from "lucide-react";
import { useEffect, useState } from "react";
import FilterSection from "../components/product/filterSection";
import { useAllProducts, useProducts } from "../hooks/useProducts";
import ProductCard from "../components/product/productCard";
import { useSearchParams } from "react-router-dom";

const CATEGORIES = ["All", "Phones", "Laptop", "Audio", "Wearables"];
const SORT_OPTIONS = ["Newest", "Price: Low → High", "Price: High → Low", "Best Rating", "lowest Rating", "Most Popular"];



export default function Products () {

    const [sort, setSort] = useState("Newest");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [category, setCategory] = useState("All");

    const [searchParams, setSearchParams] = useSearchParams();

    
    const search = searchParams.get("search") || "";
    const page = Math.max(
        1,
        Number(searchParams.get("_page") || 1)
    );

    const sortMap = {
        Newest: { _sort: "-id" },
        "Price: Low → High": { _sort: "price" },
        "Price: High → Low": { _sort: "-price" },
        "Best Rating": { _sort: "-rating" },
        "lowest Rating": { _sort: "rating" },
        "Most Popular": { _sort: "-reviews" },
    };

    
    const params = {
        _page: page,
        page_size: 6,
        ...(search.trim() 
            ? { search: search.trim() } 
            : {}),
        ...(category !== "All" ? { category } : {}),
        ...(sortMap[sort] || {}),
        // stock_gte : 20,
    }

    const { data, isLoading, error } = useProducts(params);

    const products = data?.results ?? [];
    const totalPages = Math.ceil((data?.count ?? 0) / 6);



    function changePage(nextPage) {
        const nextParams = new URLSearchParams(searchParams);

        nextParams.set("_page", String(nextPage));

        setSearchParams(nextParams);
    }


    function handleCategoryChange(nextCategory) {
        setCategory(nextCategory);
        changePage(1);
    }

    function handleSortChange(nextSort) {
        setSort(nextSort);
        changePage(1);
    }




    return (
        <div className="min-h-screen bg-[#f9f9f7]">
            <div className="max-w-7xl mx-auto px-4 py-6">

                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
                        {/* <p className="text-sm text-gray-400 mt-0.5">
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
                        </p> */}
                        {search && (
                            <p className="text-sm text-gray-500 mt-1">
                                Search results for "{search}"
                            </p>
                        )}
                    </div>


                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl bg-white text-sm
                                text-gray-600 outline-none appearance-none cursor-pointer"
                            >
                                {SORT_OPTIONS.map(op => ( <option key={op}>{op}</option> ))}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2
                                text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>


                <div className="grid md:flex justify-center gap-5 items-start">

                    {/* ── Left sidebar ── */}
                    {sidebarOpen && (
                        <aside className="w-52 shrink-0 sticky top-6">
                            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">

                                {/* Sidebar header */}
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-1">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal size={14} className="text-gray-500" />
                                        <span className="text-sm font-bold text-gray-800">Filters</span>
                                    </div>
                                </div>

                                {/* Category */}
                                <FilterSection title="Category">
                                    <div className="flex flex-col gap-0.5">
                                        {CATEGORIES.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleCategoryChange(c)}
                                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm
                                                text-left transition-colors cursor-pointer w-full
                                                ${category === c
                                                    ? "bg-gray-900 text-white"
                                                    : "text-gray-600 hover:bg-gray-50"}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </FilterSection>
                            </div>
                        </aside>
                    )}

                    {/*Right: product area*/}
                    <div className="flex-1 min-w-0">

                        {/* toggle row */}
                        <div className="flex gap-2 mb-4 flex-wrap min-h-7">
                            <button
                                onClick={() => setSidebarOpen((o) => !o)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700
                                transition-colors cursor-pointer shrink-0"
                            >
                                <SlidersHorizontal size={13} />
                                {sidebarOpen ? "Hide filters" : "Show filters"}
                            </button>
                        </div>

                        {!isLoading && (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-3 flex-col"
                            >
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}

                            </div>
                        )}

                        <div className="flex items-center justify-center gap-5 mt-8">

                            <button
                                disabled={page === 1}
                                onClick={() => changePage(page - 1)}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            >
                                prv
                            </button>

                            <span className="font-medium">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                disabled={page >= totalPages || totalPages === 0}
                                onClick={() => changePage(page + 1)}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                Next
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}