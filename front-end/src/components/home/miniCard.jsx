import { Star } from "lucide-react";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const dp  = (price, disc) => Math.round(price - (price * disc) / 100);

export default function MiniCard({ product, navigate }) {
  const price = dp(product.price, product.discount);
  return (
    <div onClick={() => navigate(`/products/${product.id}`)}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative bg-gray-50 h-44 flex items-center justify-center p-4">
        <img src={product.image} alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
        <span className={`absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${product.badgeColor}`}>
          {product.badge}
        </span>
      </div>
      <div className="p-4 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.brand}</p>
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1">
          <Star size={11} fill="#FBBF24" color="#FBBF24" />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base font-black text-gray-900">{fmt(price)}</span>
          <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
            {product.discount}% off
          </span>
        </div>
      </div>
    </div>
  );
}