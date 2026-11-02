import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchAdminCategories } from "../../redux/slice/adminProductsSlice";

function Label({ children, required }) {
    return (
        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1 ml-2 block">
            {children}
            {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
    );
}

function getInitialProductData(selectedProduct, categories) {
    if (selectedProduct) {
        let formattedSpecs = "{}";
        if (selectedProduct.specs) {
            if (typeof selectedProduct.specs === "object") {
                try {
                    formattedSpecs = JSON.stringify(selectedProduct.specs, null, 2);
                } catch {
                    formattedSpecs = "{}";
                }
            } else if (typeof selectedProduct.specs === "string") {
                formattedSpecs = selectedProduct.specs;
            }
        }

        return {
            name: selectedProduct.name || "",
            brand: selectedProduct.brand || "",
            category: selectedProduct.category ?? (categories[0]?.id || ""),
            subCategory: selectedProduct.subCategory || "",
            price: selectedProduct.price ?? 0,
            discount: selectedProduct.discount ?? 0,
            stock: selectedProduct.stock ?? 0,
            featured: Boolean(selectedProduct.featured),
            is_active: selectedProduct.is_active !== undefined ? Boolean(selectedProduct.is_active) : true,
            image: selectedProduct.image || "",
            description: selectedProduct.description || "",
            specs: formattedSpecs,
        };
    }

    return {
        name: "",
        brand: "",
        category: categories[0]?.id || "",
        subCategory: "",
        price: 0,
        discount: 0,
        stock: 0,
        featured: false,
        is_active: true,
        image: "",
        description: "",
        specs: "{}",
    };
}

export default function ProductModel({
    handleCloseModel,
    selectedProduct,
    handleModelSubmit,
}) {
    const dispatch = useDispatch();
    const { addLoading, updateLoading, error, categories, categoriesLoading } =
        useSelector((state) => state.adminProducts);

    const isLoading = addLoading || updateLoading;

    // Fetch categories if not already loaded
    useEffect(() => {
        if (!categories || categories.length === 0) {
            dispatch(fetchAdminCategories());
        }
    }, [dispatch, categories]);

    const [productData, setProductData] = useState(() =>
        getInitialProductData(selectedProduct, categories)
    );

    function handleProductData(e) {
        const { name, value, type, checked } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    }

    function handleAddProductSubmit(e) {
        e.preventDefault();

        const catId = productData.category || categories[0]?.id;

        if (
            !productData.name.trim() ||
            !productData.brand.trim() ||
            !catId ||
            Number(productData.price) < 0 ||
            Number(productData.stock) < 0 ||
            !productData.image.trim()
        ) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        let parsedSpecs = {};
        if (productData.specs && productData.specs.trim()) {
            try {
                parsedSpecs = JSON.parse(productData.specs);
                if (typeof parsedSpecs !== "object" || parsedSpecs === null || Array.isArray(parsedSpecs)) {
                    toast.error("Specs must be a JSON object, e.g. {\"RAM\": \"16GB\"}");
                    return;
                }
            } catch {
                toast.error("Specs must be valid JSON format, e.g. {\"RAM\": \"16GB\"}");
                return;
            }
        }

        const payload = {
            name: productData.name.trim(),
            brand: productData.brand.trim(),
            category: Number(catId),
            subCategory: productData.subCategory.trim(),
            price: Number(productData.price),
            discount: Number(productData.discount) || 0,
            stock: Number(productData.stock) || 0,
            featured: Boolean(productData.featured),
            is_active: Boolean(productData.is_active),
            image: productData.image.trim(),
            description: productData.description.trim(),
            specs: parsedSpecs,
        };

        handleModelSubmit(payload);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden duration-200 transition-all flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-300">
                    <h3 className="text-xl font-bold text-gray-700">
                        {selectedProduct ? "Edit Product" : "Add New Product"}
                    </h3>

                    <button
                        type="button"
                        onClick={handleCloseModel}
                        className="text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-300 rounded-full p-2 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error?.message && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                        {error.message}
                    </div>
                )}

                <form
                    onSubmit={handleAddProductSubmit}
                    className="space-y-4 p-6 overflow-y-auto flex-1"
                >
                    {/* PRODUCT NAME */}
                    <div>
                        <Label required>Product Name</Label>
                        <input
                            name="name"
                            value={productData.name}
                            onChange={handleProductData}
                            type="text"
                            placeholder="Enter product name"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    {/* ROW 2: BRAND & CATEGORY */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required>Brand</Label>
                            <input
                                name="brand"
                                value={productData.brand}
                                onChange={handleProductData}
                                type="text"
                                placeholder="Enter brand"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Label required>Category</Label>
                            <select
                                name="category"
                                value={productData.category || categories[0]?.id || ""}
                                onChange={handleProductData}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500 bg-white"
                            >
                                {categoriesLoading && categories.length === 0 ? (
                                    <option value="">Loading categories...</option>
                                ) : (
                                    categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* ROW 3: SUB CATEGORY & DISCOUNT */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Sub Category</Label>
                            <input
                                name="subCategory"
                                value={productData.subCategory}
                                onChange={handleProductData}
                                type="text"
                                placeholder="e.g. Flagship, Gaming"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Label>Discount (%)</Label>
                            <input
                                name="discount"
                                value={productData.discount}
                                onChange={handleProductData}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* ROW 4: PRICE & STOCK */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required>Price (₹)</Label>
                            <input
                                name="price"
                                value={productData.price}
                                onChange={handleProductData}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter price"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Label required>Stock</Label>
                            <input
                                name="stock"
                                value={productData.stock}
                                onChange={handleProductData}
                                type="number"
                                min="0"
                                placeholder="Enter stock"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* ROW 5: FEATURED & ACTIVE CHECKBOXES */}
                    <div className="flex gap-6 py-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={productData.featured}
                                onChange={handleProductData}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            Featured Product
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={productData.is_active}
                                onChange={handleProductData}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            Active (Visible)
                        </label>
                    </div>

                    {/* IMAGE URL */}
                    <div>
                        <Label required>Image URL</Label>
                        <input
                            name="image"
                            value={productData.image}
                            onChange={handleProductData}
                            type="text"
                            placeholder="Paste image URL"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            value={productData.description}
                            onChange={handleProductData}
                            rows="3"
                            placeholder="Enter product description"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    {/* SPECS (JSON) */}
                    <div>
                        <Label>Specs (JSON format)</Label>
                        <textarea
                            name="specs"
                            value={productData.specs}
                            onChange={handleProductData}
                            rows="2"
                            placeholder='{"RAM": "16GB", "Processor": "M3"}'
                            className="w-full font-mono text-xs rounded-xl border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCloseModel}
                            className="rounded-xl border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl bg-gray-800 px-5 py-2 font-medium text-white transition hover:bg-black disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading
                                ? "Saving..."
                                : selectedProduct
                                ? "Update Product"
                                : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
