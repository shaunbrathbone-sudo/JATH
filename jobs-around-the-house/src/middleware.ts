import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    const host = request.headers.get("host") || "";
    const isAdminSubdomain = host.toLowerCase().startsWith("admin.");

    // Redirect root requests on admin subdomain to /admin dashboard
    if (isAdminSubdomain && pathname === "/") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Protect /admin/* routes
    if (pathname.startsWith("/admin")) {
        // Enforce subdomain isolation
        if (!isAdminSubdomain) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Check login session (except for the login page itself)
        if (!pathname.startsWith("/admin/login")) {
            const sessionCookie = request.cookies.get("admin_session");

            if (!sessionCookie?.value) {
                const loginUrl = new URL("/admin/login", request.url);
                loginUrl.searchParams.set("from", pathname);
                return NextResponse.redirect(loginUrl);
            }
        }
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/", "/admin/:path*"],
};
