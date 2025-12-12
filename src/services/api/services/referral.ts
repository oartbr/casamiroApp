import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type ReferralStats = {
  referralCode: string;
  totalReferrals: number;
  weeklyReferrals: number;
  monthlyReferrals: number;
};

export type ReferralRanking = {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  referralCount: number;
};

export type ReferralRankingsResponse = {
  rankings: ReferralRanking[];
  period: string;
  limit: number;
};

export function useReferralStatsService() {
  const fetch = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/referrals/stats`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ReferralStats>);
    },
    [fetch]
  );
}

export function useReferralRankingsService() {
  const fetch = useFetch();

  return useCallback(
    (
      period: "week" | "month" | "all" = "all",
      limit: number = 10,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(
        `${API_URL}/v1/referrals/rankings?period=${period}&limit=${limit}`,
        {
          method: "GET",
          ...requestConfig,
        }
      ).then(wrapperFetchJsonResponse<ReferralRankingsResponse>);
    },
    [fetch]
  );
}
