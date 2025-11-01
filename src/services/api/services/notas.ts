import { useCallback } from "react";
import useFetch from "../use-fetch";
import useFetchBase from "../use-fetch-base";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { Tokens } from "@/services/api/types/tokens";
import { User } from "@/services/api/types/user";
import HTTP_CODES_ENUM from "../types/http-codes";
import { Status } from "../types/status";
import { Nota } from "../types/nota";

/* 
  START HERE:
  This is a template for a new service.
  Replace the {{Template}} with the object type of the service.

  ## First, the type of the request that will be sent to the server: 
  ## Check{{Template}}Request

export type Check{{Template}}Request = {
  phoneNumber: string;
};

  ## Then, the type of the expected response from the API: 
  ## Check{{Template}}Response
  ## data is generally an object with the response data, and status is the HTTP status code.
  ## The status code is used to determine if the request was successful or not, it uses the HTTP_CODES_ENUM type, 
  ## which is an enum with the most common HTTP status codes: 200, 201, 204, 400, 401, 403, 404, 500.

export type Check{{Template}}Response = {
  data: object;
  status: HTTP_CODES_ENUM;
};

  ## Then, the service function itself, which will be used in the components to make the request to the server.
  ## useCheck{{Template}}Service
  ## This is a POST function that will use the useFetchBase hook to make the request to the server.
  ## The fetchBase function is a wrapper around the fetch function, that adds the base URL to the request.
  ## The useFetchBase hook is a custom hook that returns the fetchBase function.
  ## `${API_URL}/v1/{{object}}/{{route}}` is the URL of the API endpoint, for example: `${API_URL}/v1/users/${userId}`.

export function use{{Template}}Service() {
  const fetchBase = useFetchBase();

  return useCallback(
    (data: Check{{Template}}Request, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/{{object}}/{{route}}`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Check{{Template}}Response>);
    },
    [fetchBase]
  );
}
  ## Check{{Template}}Request reponse should be a 200 status code, but the response might be void.
*/

/*
  ## Example of a GET service for Nota.
  ## This service will get a Nota by its id.
  ## The request will be a GET request, so the data will be sent in the URL.
  ## The response will be a Nota object and a status code.
*/

// ## The request will be a GET request, so the data that will be sent in the URL is just the notaId.
export type GetNoteByIdRequest = {
  notaId: string;
  user: User;
  tokens: Tokens;
};

// ## The response will be a Nota object and a status code.
export type GetNotaByIdResponse = {
  data: Nota;
  status: HTTP_CODES_ENUM;
};

export function useGetUserBySKUIdService() {
  const fetchBase = useFetchBase();

  return useCallback(
    (data: GetNoteByIdRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/nota/${data.notaId}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GetNotaByIdResponse>);
    },
    [fetchBase]
  );
}

/*
  ## Example of a GET all service for Notas, which includes pagination and filters.
  ## This service will get a list of Notas.
  ## The request will be a GET request, so the data will be sent in the URL.
  ## The response will be a list of Notas and a status code.
*/
export type NotasRequest = {
  page: number;
  limit: number;
  filters?: {
    status?: Status[];
    groupId?: Object;
  };
  sort?: Array<{
    order: SortEnum;
  }>;
  userId: string;
};

// ## The response should be a list of Notas.
// ## Here we define that we expect a Nota - as defined above - and the pagination data.
export type NotasResponse = InfinityPaginationType<Nota>;

export function useGetListingNotasByUserService() {
  const fetch = useFetch();

  return useCallback(
    (data: NotasRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/nota/getAll`);
      const oFilters = { ...data.filters, user: data.userId };
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      requestUrl.searchParams.append("filters", JSON.stringify(oFilters));
      if (data.sort) {
        requestUrl.searchParams.append("sort", JSON.stringify(data.sort));
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<NotasResponse>);
    },
    [fetch]
  );
}

// ## useCheckNotaService()
// The request will be a POST request, sending the url of the note to check.
// This action should happen after the user scans the QR code of a Nota.
// For our service, it is not really important if the nota has already being checked by a different user, unless they share the account.
export type CheckNotaRequest = {
  notaUrl: string;
  userId?: string | number | null;
};

// The response will be a Nota object and a status code.
export type CheckNotaResponse = {
  nota?: Nota;
  status: HTTP_CODES_ENUM;
  data?: { nota?: Nota };
};

// The service function itself, which will be used in the components to make the request to the server.
// useCheckNotaService
export function useCheckNotaService() {
  const fetchBase = useFetchBase();

  return useCallback(
    async (data: CheckNotaRequest, requestConfig?: RequestConfigType) => {
      const response = await fetchBase(`${API_URL}/v1/nota/check`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      });
      return wrapperFetchJsonResponse<CheckNotaResponse>(response);
    },
    [fetchBase]
  );
}

// ## useGetNotaService()
// The request will be a POST request, sending the url of the note to check.
// This action should happen after the user scans the QR code of a Nota.
// For our service, it is not really important if the nota has already being checked by a different user, unless they share the account.
export type GetNotaRequest = {
  id: string;
  userId?: string | number | null;
};

// The response will be a Nota object and a status code.
export type GetNotaResponse = {
  nota?: Nota;
  status: HTTP_CODES_ENUM;
  data?: { nota?: Nota };
};

// The service function itself, which will be used in the components to make the request to the server.
// useCheckNotaService
export function useGetNotaService() {
  const fetchBase = useFetchBase();

  return useCallback(
    async (data: GetNotaRequest, requestConfig?: RequestConfigType) => {
      const response = await fetchBase(
        `${API_URL}/v1/nota/details/${data.id}`,
        {
          method: "GET",
          ...requestConfig,
        }
      );
      return wrapperFetchJsonResponse<GetNotaResponse>(response);
    },
    [fetchBase]
  );
}
