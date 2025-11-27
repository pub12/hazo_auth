type CheckStatus = "pass" | "fail" | "warn";
type CheckResult = {
    name: string;
    status: CheckStatus;
    message: string;
};
export type ValidationSummary = {
    passed: number;
    failed: number;
    warnings: number;
    results: CheckResult[];
};
export declare function run_validation(): ValidationSummary;
export {};
//# sourceMappingURL=validate.d.ts.map