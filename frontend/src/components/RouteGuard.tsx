import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function RouteGuard() {
    const { user, isCustomer, isAgent, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading || !user) return;

        if (router.pathname.startsWith("/customer") && isAgent()) {
            router.replace("/agent");
        } else if (router.pathname.startsWith("/agent") && isCustomer()) {
            router.replace("/customer");
        }
    }, [router.pathname, isCustomer, isAgent, user, router, loading]);

    return null;
}