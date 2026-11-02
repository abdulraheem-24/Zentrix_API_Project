import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCart from "../../hooks/useCart";

export default function ProductCard({ product }) {
  
    const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100)
    const [wishListed , setWishListed] = useState(false);

    const { addItemToCart } = useCart();
    const navigate = useNavigate();

    function handleAddToCart (e) {
        e.preventDefault();
        e.stopPropagation();
        addItemToCart({newItem : product});
    }
    
    function handleMoveToProductPage (e) {
        e.preventDefault();
        navigate(`/products/${product.id}`);
    }

  return (
    <div 
        onClick={handleMoveToProductPage}
        className="group max-sm:flex overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      
      {/* Product Image */}
      <div 
        
        className="relative overflow-hidden bg-gray-100">
            <img
            src={product.image}
            alt={product.name}
            className="sm:h-64 max-sm:h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            />

            {/* Discount Badge */}
            <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            {product.discount}% OFF
            </span>

            {/* Wishlist */}
            <button 
                onClick={() => setWishListed(prv => !prv)}
                className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100">
            <Heart size={18} className={`text-gray-700 ${wishListed ? "fill-red-500 text-red-500" : "fill-white"}`} />
            </button>
      </div>

      {/* Product Content */}
      <div className="space-y-4 p-5">
        
        {/* Brand & Category */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            {product.brand}
          </p>

          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
          {product.name}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="text-sm font-medium text-gray-700">
            {product.rating}
          </span>

          <span className="text-sm text-gray-400">
            ({product.reviews || 0} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-3">
          <h3 className="text-2xl font-bold text-gray-900">
            ₹{discountedPrice.toLocaleString()}
          </h3>

          <p className="text-sm text-gray-400 line-through">
            ₹{product.price.toLocaleString()}
          </p>
        </div>

        {/* Stock Status */}
        <div>
          {product.stock > 0 ? (
            <span className="text-sm font-medium text-green-600">
              In Stock
            </span>
          ) : (
            <span className="text-sm font-medium text-red-500">
              Out of Stock
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
            
            <button 
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800">
                <ShoppingCart size={18} />
                Add to Cart
            </button>
            

            {/* <button className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                Buy
            </button> */}
        </div>
      </div>
    </div>
  );
}