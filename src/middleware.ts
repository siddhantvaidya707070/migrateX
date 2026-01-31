import { type NextRequest, NextResponse } from 'next/server'

// Simple passthrough middleware for UI demonstration
// TODO: Connect to actual auth system when backend integration is needed
export async function middleware(request: NextRequest) {
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
