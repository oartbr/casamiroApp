import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type OnboardingStatusResponse = {
  needsOnboarding: boolean;
  onboardingCompleted: boolean;
  onboardingContext: string | null;
  personalGroup: {
    id: string;
    name: string;
  } | null;
  invitedGroup: {
    id: string;
    name: string;
  } | null;
  activeGroup: {
    id: string;
    name: string;
    isPersonal: boolean;
  } | null;
  defaultList: {
    id: string;
    name: string;
    itemCount: number;
  } | null;
};

export type OnboardingStatusRequest = {
  userId: string;
};

export function useGetOnboardingStatusService() {
  const fetch = useFetch();

  return useCallback(
    (data: OnboardingStatusRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/onboarding/${data.userId}/status`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<OnboardingStatusResponse>);
    },
    [fetch]
  );
}

export type UpdateOnboardingContextRequest = {
  userId: string;
  context: "casa" | "casal" | "republica" | "escritorio" | "condominio";
};

export type UpdateOnboardingContextResponse = {
  id: string;
  onboardingContext: string;
  onboardingStartedAt: string | null;
};

export function useUpdateOnboardingContextService() {
  const fetch = useFetch();

  return useCallback(
    (
      data: UpdateOnboardingContextRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/onboarding/${data.userId}/context`, {
        method: "PATCH",
        body: JSON.stringify({ context: data.context }),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UpdateOnboardingContextResponse>);
    },
    [fetch]
  );
}

export type CompleteOnboardingRequest = {
  userId: string;
};

export type CompleteOnboardingResponse = {
  id: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string;
};

export function useCompleteOnboardingService() {
  const fetch = useFetch();

  return useCallback(
    (data: CompleteOnboardingRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/onboarding/${data.userId}/complete`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CompleteOnboardingResponse>);
    },
    [fetch]
  );
}

export type CheckUserActivationRequest = {
  userId: string;
};

export type CheckUserActivationResponse = {
  isActivated: boolean;
  hasGroupInteraction: boolean;
  hasReceivedSuggestions: boolean;
  details: {
    hasListInteraction: boolean;
    hasInviteInteraction: boolean;
  };
};

export function useCheckUserActivationService() {
  const fetch = useFetch();

  return useCallback(
    (data: CheckUserActivationRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/onboarding/${data.userId}/activation`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CheckUserActivationResponse>);
    },
    [fetch]
  );
}
