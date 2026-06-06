const queryKeys = {
    bookings: {
        all: ["bookings"] as const,
        lists: () => [...queryKeys.bookings.all, "list"] as const,
        list: (filters: Record<string, unknown>) =>
            [...queryKeys.bookings.lists(), filters] as const,
        details: () => [...queryKeys.bookings.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    },
    products: {
        all: ["products"] as const,
        lists: () => [...queryKeys.products.all, "list"] as const,
        details: () => [...queryKeys.products.all, "detail"] as const,
        detail: (slug: string) =>
            [...queryKeys.products.details(), slug] as const,
    },
    services: {
        all: ["services"] as const,
        lists: () => [...queryKeys.services.all, "list"] as const,
        details: () => [...queryKeys.services.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.services.details(), id] as const,
    },
    pricing: {
        calculate: (answers: unknown) =>
            ["pricing", "calculate", answers] as const,
    },
} as const;

export { queryKeys };
