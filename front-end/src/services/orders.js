
import api from "./api";

export async function getOrders() {
  const { data } = await api.get("orders/");
  return data.results ?? data;
}

export async function getParamsOrders(params = {}) {
  const { data } = await api.get("orders/", { params });
  return data.results ?? data;
}

export async function cancelOrder(orderId) {
  const { data } = await api.post(`orders/${orderId}/cancel/`);
  return data;
}
