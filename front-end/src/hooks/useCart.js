import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  setCart,
  setCartLoading,
  setCartError,
  clearCartState,
} from "../redux/slice/cartSlice";


import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearServerCart,
} from "../services/cartService";


import { logout } from "../redux/slice/authSlice";



export default function useCart () {
    const dispatch = useDispatch();

   const {
        items,
        totalQuantity,
        totalAmount,
        loading,
        error,
    } = useSelector((state) => state.cart);

    const { isAuthenticated } = useSelector(state => state.auth);

    // need to learn
    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
        dispatch(clearCartState());
        return;
        }

        dispatch(setCartLoading(true));

        try {
        const cart = await getCart();
        dispatch(setCart(cart));
        } catch (err) {
        dispatch(setCartError(
            err.response?.data?.detail || "Unable to load cart",
        ));
        throw err;
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        refreshCart().catch(() => {});
    }, [refreshCart]);

    
    const addItemToCart = async ({ newItem, quantity = 1 }) => {
        if (!isAuthenticated) {
        toast.error("Please log in first");
        return false;
        }

        try {
        const cart = await addCartItem(newItem.id, quantity);
        dispatch(setCart(cart));
        toast.success(`${newItem.name} added to cart`);
        return true;
        } catch (err) {
        toast.error(
            err.response?.data?.quantity?.[0] ||
            err.response?.data?.detail ||
            "Unable to add item to cart",
        );
        return false;
        }
    };

    const removeItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      await refreshCart();
    } catch (err) {
      toast.error("Unable to remove item");
    }
  };

  const updateItemQuantity = async ({ id, quantity }) => {
    if (quantity < 1) {
      return removeItem(id);
    }

    try {
      const cart = await updateCartItem(id, quantity);
      dispatch(setCart(cart));
    } catch (err) {
      toast.error(
        err.response?.data?.quantity?.[0] ||
        "Unable to update quantity",
      );
    }
  };

  const emptyCart = async () => {
    try {
      await clearServerCart();
      await refreshCart();
    } catch (err) {
      toast.error("Unable to clear cart");
    }
  };

  return {
    items,
    totalQuantity,
    totalAmount,
    loading,
    error,
    refreshCart,
    addItemToCart,
    removeItem,
    updateItemQuantity,
    emptyCart,
  };
}