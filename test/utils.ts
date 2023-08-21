export const DECIMALS = 1_000_000_000_000_000_000n;
export async function waitFor(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}