import api from "./api";

export async function getProducts (params = {}) {
    const { data } = await api.get("products/", { params });
    
    return data;
}


export async function getPorductsById (id) {
    const { data } = await api.get(`products/${id}/`);
    return data;
}


export async function getAllProducts() {
  const { data } = await api.get("products/");
  return data.results ?? data;
}






export const fetchSuggestions = async (search, options = {}) => {
  const { data } = await api.get("products/", {
    params: {
      search,
      _page: 1,
      page_size: 5,
    },
    signal: options.signal,
  });

  return data.results ?? [];
};





export async function getHeroProducts() {
    const { data } = await api.get("products/hero/");
    return data;
}