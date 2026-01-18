type NextAuthContext = {
    params: Promise<{
        nextauth: string[];
    }>;
};
export declare function GET(request: Request, context: NextAuthContext): Promise<any>;
export declare function POST(request: Request, context: NextAuthContext): Promise<any>;
export {};
//# sourceMappingURL=nextauth.d.ts.map