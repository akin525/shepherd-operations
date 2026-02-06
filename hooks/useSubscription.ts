"use client";

import { useState, useEffect, useCallback } from "react";
import { getSubscriptions, SubscriptionData } from "@/actions/subscription";

export function useSubscription(
  initialPage: number = 1,
  initialService?: string,
  initialStatus?: string,
  initialPeriod?: string
) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    service: initialService,
    status: initialStatus,
    period: initialPeriod,
  });

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getSubscriptions(
      page,
      filters.service,
      filters.status,
      filters.period
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  }, [page, filters.service, filters.status, filters.period]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const updateFilters = (newFilters: {
    service?: string;
    status?: string;
    period?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); 
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const refresh = () => {
    fetchSubscriptions();
  };

  return {
    data,
    isLoading,
    error,
    page,
    filters,
    updateFilters,
    goToPage,
    refresh,
  };
}
