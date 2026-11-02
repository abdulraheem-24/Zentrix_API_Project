import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
import { useProduct } from "../hooks/useProducts";
import useCart from "../hooks/useCart";

export default function ProductPage() {


    const { id } = useParams();

    const {
        data: product,
        isLoading,
        error
    } = useProduct(id);

    const [quantity , setQuantity] = useState(1);
    const {addItemToCart} = useCart()

    const discountedPrice = product
        ? Math.round(
            product.price -
            (product.price * product.discount) / 100
        )
        : 0;


    function handleAddToCart (e) {
        e.preventDefault();
        const response = addItemToCart({newItem : product, quantity : quantity});
        if (response) setQuantity(1);
    }



    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-lg font-medium">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20 text-red-500 text-lg">
                Something went wrong
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Product Image */}
                <div className="bg-gray-100 rounded-3xl p-8 flex items-center justify-center">

                    <img
                        src={product?.image}
                        alt={product?.name}
                        className="w-full max-h-125 object-contain"
                    />

                </div>

                {/* Product Details */}
                <div className="flex flex-col gap-6">

                    {/* Category */}
                    <div className="flex items-center gap-3">

                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                            {product?.category}
                        </span>

                        <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                            {product?.subCategory}
                        </span>

                    </div>

                    {/* Product Name */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {product?.name}
                    </h1>

                    {/* Brand */}
                    <p className="text-lg text-gray-500">
                        Brand:
                        {" "}
                        <span className="font-semibold text-gray-800">
                            {product?.brand}
                        </span>
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg">

                            <Star
                                size={16}
                                className="fill-white"
                            />

                            <span className="font-medium">
                                {product?.rating}
                            </span>

                        </div>

                        <span className="text-gray-500">
                            ({product?.reviews} reviews)
                        </span>

                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-4">

                        <h2 className="text-4xl font-bold text-gray-900">
                            ₹{discountedPrice.toLocaleString()}
                        </h2>

                        <p className="text-xl text-gray-400 line-through">
                            ₹{product?.price.toLocaleString()}
                        </p>

                        <span className="text-green-600 font-semibold">
                            {product?.discount}% OFF
                        </span>

                    </div>

                    {/* Stock */}
                    <div>

                        {product?.stock > 0 ? (
                            <span className="text-green-600 font-medium">
                                In Stock ({product.stock} left)
                            </span>
                        ) : (
                            <span className="text-red-500 font-medium">
                                Out of Stock
                            </span>
                        )}

                    </div>

                    {/* Description */}
                    <div>

                        <h3 className="text-xl font-semibold mb-2">
                            Description
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                            {product?.description}
                        </p>

                    </div>

                    {/* Specs */}
                    <div>

                        <h3 className="text-xl font-semibold mb-4">
                            Specifications
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="font-medium text-gray-500">
                                    Display
                                </p>

                                <p className="mt-1 text-gray-800">
                                    {product?.specs?.display}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="font-medium text-gray-500">
                                    Battery
                                </p>

                                <p className="mt-1 text-gray-800">
                                    {product?.specs?.battery}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="font-medium text-gray-500">
                                    Connectivity
                                </p>

                                <p className="mt-1 text-gray-800">
                                    {product?.specs?.connectivity}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="font-medium text-gray-500">
                                    Water Resistance
                                </p>

                                <p className="mt-1 text-gray-800">
                                    {product?.specs?.waterResistance}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="font-medium text-gray-500">
                                    Storage
                                </p>

                                <p className="mt-1 text-gray-800">
                                    {product?.specs?.storage}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="font-medium text-gray-500">
                                    Compatibility
                                </p>

                                <p className="mt-1 text-gray-800">
                                    {product?.specs?.compatibility}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Features */}
                    <div>

                        <h3 className="text-xl font-semibold mb-4">
                            Features
                        </h3>

                        <div className="flex flex-wrap gap-3">

                            {product?.specs?.features?.map((feature, index) => (

                                <span
                                    key={index}
                                    className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700"
                                >
                                    {feature}
                                </span>

                            ))}

                        </div>

                    </div>

                    <div className="flex w-fit items-center gap-8 rounded-2xl border border-gray-200 px-8 py-3">

                        <button
                            onClick={() => setQuantity(prv => prv > 1 ? prv - 1 : 1)}
                            className="text-gray-600 transition hover:text-black"
                        >
                            <Minus size={18} />
                        </button>

                        <div className="text-sm font-semibold">
                            {quantity}
                        </div>

                        <button
                            onClick={() => setQuantity(prv => prv + 1)}
                            className="text-gray-600 transition hover:text-black"
                        >
                            <Plus size={18} />
                        </button>

                    </div>

                    {/* Add To Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="mt-4 flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-medium text-lg transition hover:bg-gray-800"
                    >

                        <ShoppingCart size={22} />

                        Add To Cart

                    </button>

                </div>

            </div>

        </div>
    );
}