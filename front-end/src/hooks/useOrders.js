import { useQuery } from "@tanstack/react-query";
import { getOrders, getParamsOrders } from "../services/orders";


export default function useOrders () {
    return useQuery({
            queryKey : ["orders"],
            queryFn : getOrders,
        })
}


export function useParamsOrders (params) {
    return useQuery({
            queryKey : ["orders",params],
            queryFn : () => getParamsOrders(params),
        })
}
