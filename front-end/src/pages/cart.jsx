import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";

export default function CartPage() {

    const cartProducts = useSelector(state => state.cart.items);
    const navigate = useNavigate();

    const {removeItem , updateItemQuantity} = useCart()

    console.log(cartProducts)

    const subtotal = cartProducts.reduce(
        (acc, item) => acc + (item.price - (item.price * item.discount) / 100) * item.quantity, 0
    );

    
    const shipping = 0;
    // const tax = 499;
    const total = subtotal + shipping;



    function handleMoveToProductPage (e , id) {
        e.preventDefault();
        navigate(`/products/${id}`);
    }

    function handleRemoveFromCart (e , id) {
        e.preventDefault();
        e.stopPropagation();
        removeItem(id);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
            
            {/* Heading */}
            <div className="mb-8 flex items-center gap-3">
                <div className="rounded-2xl bg-black p-3 text-white">
                    <ShoppingBag size={24} />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                    Shopping Cart
                    </h1>

                    <p className="text-gray-500">
                    {cartProducts.length} items in your cart
                    </p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            
                {/* Cart Products */}
                <div className="space-y-5">

                    {cartProducts.map((product) => (
                    <div
                        onClick={(e) => handleMoveToProductPage(e, product.product_id)}
                        key={product.id}
                        className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row"
                    >
                        {/* Product Image */}
                        <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-gray-100 sm:w-40">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-28 object-contain"
                        />
                        </div>

                        {/* Product Content */}
                        <div className="flex flex-1 flex-col justify-between">
                        
                        {/* Top */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                            <p className="text-sm font-medium text-gray-500">
                                {product.brand}
                            </p>

                            <h2 className="mt-1 text-xl font-semibold text-gray-900">
                                {product.name}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {product.category}
                            </p>
                            </div>

                            {/* Remove */}
                            <button 
                                onClick={(e) => handleRemoveFromCart(e, product.id)}
                                className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* Bottom */}
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            
                            {/* Quantity */}
                            <div 
                                onClick={e => e.stopPropagation()}
                                className="flex w-fit items-center gap-4 rounded-2xl border border-gray-200 px-4 py-2">
                                <button 
                                    onClick={() => updateItemQuantity({id : product.id , quantity : product.quantity - 1})}
                                    className="text-gray-600 transition hover:text-black">
                                        <Minus size={18} />
                                </button>

                                <span className="text-sm font-semibold">
                                    {product.quantity}
                                </span>

                                <button 
                                    onClick={() => updateItemQuantity({id : product.id , quantity : product.quantity + 1})}
                                    className="text-gray-600 transition hover:text-black">
                                        <Plus size={18} />
                                </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                <p className= "text-green-700">
                                    {product.discount}% off
                                </p>
                                <p className="text-sm text-gray-400 line-through">
                                    ₹{product.price.toLocaleString()}
                                </p>

                                <h3 className="text-2xl font-bold text-gray-900">
                                    ₹
                                    {(product
                                        ? Math.round(
                                            (
                                                product.price -
                                                (product.price * product.discount) / 100
                                            ) * product.quantity
                                        )
                                        : 0).toLocaleString()}
                                </h3>
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    
                    <h2 className="text-2xl font-bold text-gray-900">
                    Order Summary
                    </h2>

                    {/* Summary Details */}
                    <div className="mt-6 space-y-5">
                    
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                        Subtotal
                        </span>

                        <span className="font-semibold text-gray-900">
                        ₹{subtotal.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                        Shipping
                        </span>

                        <span className="font-semibold text-green-700">
                        Free
                        </span>
                    </div>

                    {/* <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                        Tax
                        </span>

                        <span className="font-semibold text-gray-900">
                        ₹{tax}
                        </span>
                    </div> */}

                    {/* Total */}
                    <div className="border-t border-dashed border-gray-200 pt-5">
                        <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                            Total
                        </span>

                        <span className="text-3xl font-bold text-black">
                            {subtotal ? `₹${total.toLocaleString("en-IN")}`: 0}
                        </span>
                        </div>
                    </div>
                    </div>

                    {/* Coupon */}
                    {/* <div className="mt-8 flex gap-3">
                        <input
                            type="text"
                            placeholder="Coupon code"
                            className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                        />

                        <button className="rounded-2xl bg-gray-100 px-5 font-medium transition hover:bg-gray-200">
                            Apply
                        </button>
                    </div> */}

                    {/* Checkout */}
                    <Link 
                        to={"/checkout"}>
                        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-medium text-white transition hover:bg-gray-800">
                            Proceed to Checkout
                            <ArrowRight size={18} />
                        </button>
                    </Link>

                    {/* Continue Shopping */}
                    <Link to={"/Products"}>
                        <button className="mt-4 w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                            Continue Shopping
                        </button>
                    </Link>
                </div>
            </div>
        </div>
        </div>
    );
}