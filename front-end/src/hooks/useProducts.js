import { useQuery } from "@tanstack/react-query";
import {
    getAllProducts,
    getPorductsById,
    getProducts,
    getHeroProducts,
} from "../services/products";



export function useProducts(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}


export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getPorductsById(id),
    enabled: Boolean(id),
  });
}


export function useAllProducts() {
  return useQuery({
    queryKey: ["allProducts"],
    queryFn: getAllProducts,
  });
}



export function useHeroProducts() {
    return useQuery({
        queryKey: ["hero-products"],
        queryFn: getHeroProducts,
        staleTime: 5 * 60 * 1000,
    });
}