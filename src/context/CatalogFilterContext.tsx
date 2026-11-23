"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { PRODUCTS, type Product } from "@/data/products";
import { matchesTireSize, parseTireSize } from "@/lib/tire-size";

export type CategoryNavKey =
  | "tutti"
  | "estivi"
  | "invernali"
  | "4-stagioni"
  | "auto"
  | "suv-furgo"
  | "accessori";

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export interface CatalogFilters {
  category: CategoryNavKey;
  tireSize: string;
  season: string;
  brand: string;
  search: string;
  sort: SortOption;
}

const DEFAULT_FILTERS: CatalogFilters = {
  category: "tutti",
  tireSize: "",
  season: "all",
  brand: "all",
  search: "",
  sort: "featured",
};

interface CatalogFilterContextValue {
  filters: CatalogFilters;
  filteredProducts: Product[];
  hasActiveFilters: boolean;
  setFilter: <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K]
  ) => void;
  setCategoryNav: (category: CategoryNavKey) => void;
  resetFilters: () => void;
}

const CatalogFilterContext = createContext<CatalogFilterContextValue | null>(
  null
);

export function CatalogFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);

  const setFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setCategoryNav = useCallback((category: CategoryNavKey) => {
    setFilters((prev) => ({
      ...prev,
      category,
      season:
        category === "estivi" ||
        category === "invernali" ||
        category === "4-stagioni" ||
        category === "accessori"
          ? category
          : "all",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== "tutti" ||
      parseTireSize(filters.tireSize).digits.length > 0 ||
      filters.season !== "all" ||
      filters.brand !== "all" ||
      filters.search.trim().length > 0
    );
  }, [filters]);

  const filteredProducts = useMemo(() => {
    const query = filters.search.trim().toLowerCase().replace(/\s+/g, "");

    const matched = PRODUCTS.filter((product) => {
      if (filters.category === "auto" && product.vehicle !== "auto") {
        return false;
      }
      if (filters.category === "suv-furgo" && product.vehicle !== "suv-furgo") {
        return false;
      }
      if (filters.category === "accessori" && product.season !== "accessori") {
        return false;
      }
      if (
        (filters.category === "estivi" ||
          filters.category === "invernali" ||
          filters.category === "4-stagioni") &&
        product.season !== filters.category
      ) {
        return false;
      }

      if (filters.season !== "all" && product.season !== filters.season) {
        return false;
      }
      if (!matchesTireSize(product, filters.tireSize)) {
        return false;
      }
      if (filters.brand !== "all" && product.brand !== filters.brand) {
        return false;
      }

      if (query.length > 0) {
        const diamDigits = (product.diameter ?? "").replace(/\D/g, "");
        const numericSize =
          product.width && product.aspectRatio && diamDigits
            ? `${product.width}${product.aspectRatio}${diamDigits}`
            : "";
        const slashSize =
          product.width && product.aspectRatio && diamDigits
            ? `${product.width}/${product.aspectRatio}/${diamDigits}`
            : "";

        const searchable = [
          product.brand,
          product.model,
          product.sizeLabel,
          product.sizeLabel.replace(/\//g, ""),
          numericSize,
          slashSize,
          product.seasonLabel,
          product.vehicleLabel,
          product.shortDescription,
        ]
          .join(" ")
          .toLowerCase()
          .replace(/\s+/g, "");

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...matched];
    switch (filters.sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceEur - b.priceEur);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceEur - a.priceEur);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "featured":
      default:
        sorted.sort((a, b) => Number(a.badgeNumber) - Number(b.badgeNumber));
        break;
    }

    return sorted;
  }, [filters]);

  const value = useMemo<CatalogFilterContextValue>(
    () => ({
      filters,
      filteredProducts,
      hasActiveFilters,
      setFilter,
      setCategoryNav,
      resetFilters,
    }),
    [
      filters,
      filteredProducts,
      hasActiveFilters,
      setFilter,
      setCategoryNav,
      resetFilters,
    ]
  );

  return (
    <CatalogFilterContext.Provider value={value}>
      {children}
    </CatalogFilterContext.Provider>
  );
}

export function useCatalogFilter(): CatalogFilterContextValue {
  const ctx = useContext(CatalogFilterContext);
  if (!ctx) {
    throw new Error(
      "useCatalogFilter deve essere usato dentro CatalogFilterProvider"
    );
  }
  return ctx;
}
