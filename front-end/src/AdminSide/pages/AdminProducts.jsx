import { useEffect, useState } from "react";
import { Edit, Package, PlusIcon, Star, Trash } from "lucide-react";
import ProductModel from "../components/ProductModal";
import { useDispatch, useSelector } from "react-redux";
import {
    addAdminProduct,
    deleteAdminProduct,
    fetchAdminCategories,
    fetchAdminProducts,
    updateAdminProduct,
} from "../../redux/slice/adminProductsSlice";

export default function AdminProducts() {
    const [page, setPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [searchProducts, setSearchProducts] = useState("");

    const dispatch = useDispatch();

    const {
        products,
        categories,
        fetchLoading: isLoading,
        error,
        totalItems,
    } = useSelector((state) => state.adminProducts);

    useEffect(() => {
        dispatch(fetchAdminCategories());
    }, [dispatch]);

    useEffect(() => {
        dispatch(
            fetchAdminProducts({
                page: page,
            })
        );
    }, [page, dispatch]);

    const PAGE_SIZE = 12;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const getCategoryName = (categoryId) => {
        if (!categoryId && categoryId !== 0) return "—";
        const found = categories.find((c) => c.id === categoryId);
        if (found) return found.name;
        return typeof categoryId === "string" ? categoryId : `Category #${categoryId}`;
    };

    const filterdProducts = products.filter((product) => {
        const query = searchProducts.trim().toLowerCase();
        if (!query) return true;
        const nameMatch = product.name?.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query);
        const catName = getCategoryName(product.category).toLowerCase();
        const catMatch = catName.includes(query);
        const subCatMatch = product.subCategory?.toLowerCase().includes(query);
        return nameMatch || brandMatch || catMatch || subCatMatch;
    });

    function handleOpenModel(product = null) {
        setSelectedProduct(product);
        setOpenModal(true);
    }

    function handleCloseModel() {
        setOpenModal(false);
        setSelectedProduct(null);
    }

    async function handleDeleteProduct(e, id) {
        e.preventDefault();
        if (window.confirm("Are you sure you want to deactivate this product?")) {
            await dispatch(deleteAdminProduct(id));
            dispatch(fetchAdminProducts({ page }));
        }
    }

    async function handleModelSubmit(productData) {
        if (selectedProduct) {
            const result = await dispatch(
                updateAdminProduct({
                    id: selectedProduct.id,
                    productData,
                })
            );
            if (!result.error) {
                handleCloseModel();
                dispatch(fetchAdminProducts({ page }));
            }
        } else {
            const result = await dispatch(addAdminProduct(productData));
            if (!result.error) {
                handleCloseModel();
                setPage(1);
                dispatch(fetchAdminProducts({ page: 1 }));
            }
        }
    }

    return (
        <div className="p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
                <h1 className="text-3xl font-bold">Products</h1>

                <div className="flex flex-1 max-w-md w-full">
                    <input
                        value={searchProducts}
                        onChange={(e) => setSearchProducts(e.target.value)}
                        type="search"
                        placeholder="Search products by name, brand, category..."
                        className="w-full border border-gray-400 rounded-2xl px-5 py-3 outline-none focus:border-black"
                    />
                </div>

                <button
                    onClick={() => handleOpenModel(null)}
                    className="flex items-center bg-black text-white px-6 py-3 font-bold rounded-2xl border hover:text-black hover:bg-white transition-all cursor-pointer"
                >
                    <PlusIcon size={20} className="mt-0.5 mr-1" />
                    Add Product
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-4">
                    {error.message || "Failed to load products."}
                </div>
            )}

            {!isLoading && !error && filterdProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <Package size={26} className="text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-700">No products found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchProducts ? "Try another search term." : "Add your first product to get started."}
                    </p>
                </div>
            )}

            {!isLoading && !error && filterdProducts.length > 0 && (
                <div className="p-2 w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[700px] divide-gray-200 text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-3.5 text-black font-bold text-left">Product</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">Category</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">Price</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">Stock</th>
                                <th className="px-6 py-3.5 text-black font-bold text-center">Status</th>
                                <th className="px-6 py-3.5 text-black font-bold text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {filterdProducts.map((product) => (
                                <tr key={product.id} className="shadow-sm text-center">
                                    <td className="p-3 flex items-center gap-4 text-left">
                                        <img
                                            className="w-16 h-16 shrink-0 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100"
                                            src={product.image || "https://placehold.co/100x100?text=No+Image"}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/100x100?text=No+Image";
                                            }}
                                        />
                                        <div className="grid gap-1">
                                            <div>
                                                <h3 className="text-[14px] font-bold text-gray-900">{product.name}</h3>
                                                <p className="text-gray-500">{product.brand}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                                <p className="text-gray-600 font-medium">
                                                    {Number(product.rating || 0).toFixed(1)}
                                                </p>
                                                <span className="text-gray-400 text-[10px]">
                                                    ({product.reviews || 0})
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex justify-center">
                                            <span className="font-semibold text-xs text-blue-800 bg-blue-100 rounded-full px-3 py-1">
                                                {getCategoryName(product.category)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="font-semibold text-gray-900">
                                        ₹{Number(product.price).toLocaleString("en-IN")}
                                        {Number(product.discount) > 0 && (
                                            <span className="block text-[10px] text-green-600 font-normal">
                                                {product.discount}% off
                                            </span>
                                        )}
                                    </td>

                                    <td className="font-medium text-gray-700">
                                        {product.stock}
                                    </td>

                                    <td>
                                        <div className="flex justify-center">
                                            <span
                                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                                    product.is_active
                                                        ? "bg-green-100 text-green-800 border border-green-200"
                                                        : "bg-red-100 text-red-800 border border-red-200"
                                                }`}
                                            >
                                                {product.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModel(product)}
                                            title="Edit product"
                                            className="text-indigo-600 hover:text-indigo-900 mr-2 bg-indigo-50 p-2 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteProduct(e, product.id)}
                                            disabled={!product.is_active}
                                            title={product.is_active ? "Deactivate product" : "Already deactivated"}
                                            className={`p-2 rounded-lg transition-colors ${
                                                product.is_active
                                                    ? "text-red-600 hover:text-red-900 bg-red-50 cursor-pointer"
                                                    : "text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                                            }`}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-center gap-5 mt-8 mb-4">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-medium text-xs cursor-pointer"
                        >
                            Prev
                        </button>

                        <span className="font-medium text-xs text-gray-700">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-medium text-xs cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {openModal && (
                <ProductModel
                    key={selectedProduct ? selectedProduct.id : "new"}
                    openModal={openModal}
                    handleCloseModel={handleCloseModel}
                    selectedProduct={selectedProduct}
                    handleModelSubmit={handleModelSubmit}
                />
            )}
        </div>
    );
}
