// Single store by default (the Viogi launch). `NEXT_PUBLIC_MARKETPLACE=on`
// turns on the platform: selling, following and store profiles.
export const isMarketplace = process.env.NEXT_PUBLIC_MARKETPLACE === 'on';
