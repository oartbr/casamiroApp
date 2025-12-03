import { useCallback } from "react";
import useFetch from "../use-fetch";
import useFetchBase from "../use-fetch-base";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import HTTP_CODES_ENUM from "../types/http-codes";
import { CanonicalProduct } from "../types/canonicalProduct";

// Create CanonicalProduct
export type CreateCanonicalProductRequest = {
  canonical_name: string;
  canonical_name_normalized?: string;
  brand?: string | null;
  brand_normalized?: string | null;
  category?: string | null;
  subcategory?: string | null;
  category_key?: string | null;
  package_size?: string | null;
  unit?: string | null;
  quantity?: number | null;
  package_description?: string | null;
  gtin?: string | null;
  ncm?: string | null;
  origin?: string | null;
  synonyms?: string[];
  synonyms_normalized?: string[];
  synonyms_stats?: Array<{ synonym: string; count: number }>;
  is_alcoholic?: boolean | null;
  is_fresh_produce?: boolean | null;
  is_bulk?: boolean | null;
  confidence?: number;
  source?: string;
  embedding?: number[] | null;
  scope?: "global" | "group";
  group_id?: string | null;
  created_by?: string;
  updated_by?: string;
};

export type CreateCanonicalProductResponse = {
  data: {
    product: CanonicalProduct;
  };
  status: HTTP_CODES_ENUM;
};

export function useCreateCanonicalProductService() {
  const fetchBase = useFetchBase();

  return useCallback(
    (
      data: CreateCanonicalProductRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/canonical-products`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CreateCanonicalProductResponse>);
    },
    [fetchBase]
  );
}

// Get all CanonicalProducts
export type CanonicalProductsRequest = {
  page: number;
  limit: number;
  filters?: {
    scope?: "global" | "group";
    group_id?: string;
    category_key?: string;
    brand?: string;
  };
  sort?: Array<{
    orderBy: string;
    order: SortEnum;
  }>;
};

export type CanonicalProductsResponse =
  InfinityPaginationType<CanonicalProduct>;

export function useGetCanonicalProductsService() {
  const fetch = useFetch();

  return useCallback(
    (data: CanonicalProductsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/canonical-products`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }
      if (data.sort) {
        requestUrl.searchParams.append("sort", JSON.stringify(data.sort));
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CanonicalProductsResponse>);
    },
    [fetch]
  );
}

// Get CanonicalProduct by ID
export type GetCanonicalProductByIdRequest = {
  id: string;
};

export type GetCanonicalProductByIdResponse = {
  data: {
    product: CanonicalProduct;
  };
  status: HTTP_CODES_ENUM;
};

export function useGetCanonicalProductByIdService() {
  const fetchBase = useFetchBase();

  return useCallback(
    (
      data: GetCanonicalProductByIdRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/canonical-products/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GetCanonicalProductByIdResponse>);
    },
    [fetchBase]
  );
}

// Update CanonicalProduct
export type UpdateCanonicalProductRequest = {
  id: string;
  data: Partial<CreateCanonicalProductRequest>;
};

export type UpdateCanonicalProductResponse = {
  data: {
    product: CanonicalProduct;
  };
  status: HTTP_CODES_ENUM;
};

export function useUpdateCanonicalProductService() {
  const fetchBase = useFetchBase();

  return useCallback(
    (
      data: UpdateCanonicalProductRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/canonical-products/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UpdateCanonicalProductResponse>);
    },
    [fetchBase]
  );
}

// Delete CanonicalProduct
export type DeleteCanonicalProductRequest = {
  id: string;
};

export type DeleteCanonicalProductResponse = {
  status: HTTP_CODES_ENUM;
};

export function useDeleteCanonicalProductService() {
  const fetchBase = useFetchBase();

  return useCallback(
    (
      data: DeleteCanonicalProductRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetchBase(`${API_URL}/v1/canonical-products/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<DeleteCanonicalProductResponse>);
    },
    [fetchBase]
  );
}

// Search CanonicalProducts
export type SearchCanonicalProductsRequest = {
  q: string;
  groupId?: string | null;
};

export type SearchCanonicalProductsResponse = {
  data: {
    products: CanonicalProduct[];
  };
  status: HTTP_CODES_ENUM;
};

export function useSearchCanonicalProductsService() {
  const fetch = useFetch();

  return useCallback(
    (
      data: SearchCanonicalProductsRequest,
      requestConfig?: RequestConfigType
    ) => {
      const requestUrl = new URL(`${API_URL}/v1/canonical-products/search`);
      requestUrl.searchParams.append("q", data.q);
      if (data.groupId) {
        requestUrl.searchParams.append("groupId", data.groupId);
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SearchCanonicalProductsResponse>);
    },
    [fetch]
  );
}

// Create CanonicalProduct from Nota Item
export type CreateFromNotaItemRequest = {
  productData: {
    product?: string;
    name?: string;
    code?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    totalPrice?: number | null;
  };
  userId?: string;
  groupId?: string | null;
  useOpenAI?: boolean;
};

export type CreateFromNotaItemResponse = {
  data: {
    product: CanonicalProduct;
  };
  status: HTTP_CODES_ENUM;
};

export function useCreateCanonicalProductFromNotaItemService() {
  const fetchBase = useFetchBase();

  return useCallback(
    (data: CreateFromNotaItemRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/canonical-products/from-nota-item`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CreateFromNotaItemResponse>);
    },
    [fetchBase]
  );
}
