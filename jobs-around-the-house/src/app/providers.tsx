"use client";

import React from "react";
import QueryProvider from "@/components/providers/query-provider";

type ProvidersProps = {
    children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
    return <QueryProvider>{children}</QueryProvider>;
};

export default Providers;
