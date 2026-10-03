export type FeatureFlags = {
  wallet: boolean; purchase: boolean; proofOfReserves: boolean; redemption: boolean;
};
export const PRELAUNCH_FEATURES: FeatureFlags = {
  wallet: false, purchase: false, proofOfReserves: false, redemption: false,
};
