export interface DepositData {
  depositId: BigInt;
  projectId: BigInt;
  token: string;
  amount: BigInt;
  expireTime: BigInt;
}

export interface WithdrawalData {
  withdrawId: bigint;
  projectId: bigint;
  token: string;
  amount: bigint;
  recipient: string;
  expireTime: bigint;
}

export interface ClaimData {
  claimId: bigint;
  projectId: bigint;
  token: string;
  amount: bigint;
  recipient: string;
  expireTime: bigint;
}

export enum ActionType {
  Deposit,
  Withdraw,
  Claim,
}
