// hooks/usePayment.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPayments, PaymentData } from "@/actions/payment";

export function usePayment(
  initialPage: number = 1,
  initialQ?: string,
  initialType?: string,
  initialStatus?: string,
  initialFrom?: string,
  initialTo?: string
) {
  const [data, setData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    q: initialQ,
    type: initialType,
    status: initialStatus,
    from: initialFrom,
    to: initialTo,
  });

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getPayments(
      page,
      filters.q,
      filters.type,
      filters.status,
      filters.from,
      filters.to
    );

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  }, [page, filters.q, filters.type, filters.status, filters.from, filters.to]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
  }, [fetchPayments]);

  const updateFilters = (newFilters: {
    q?: string;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); 
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const refresh = () => {
    fetchPayments();
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