import { ethers, Signer } from "ethers";
import { DepositData, WithdrawalData, ClaimData, ActionType } from "./types";

export async function generateSignature(
  actionType: ActionType,
  value: DepositData | WithdrawalData | ClaimData,
  signer: Signer,
  verifyingContract: string,
  chainId: bigint
) {
  let types;
  switch (actionType) {
    case ActionType.Claim: {
      types = {
        ClaimData: [
          { name: "claimId", type: "uint256" },
          { name: "projectId", type: "uint256" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "expireTime", type: "uint256" },
        ],
      };
      break;
    }
    case ActionType.Deposit: {
      types = {
        DepositData: [
          { name: "depositId", type: "uint256" },
          { name: "projectId", type: "uint256" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "expireTime", type: "uint256" },
        ],
      };
      break;
    }
    case ActionType.Withdraw: {
      types = {
        WithdrawalData: [
          { name: "withdrawId", type: "uint256" },
          { name: "projectId", type: "uint256" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "expireTime", type: "uint256" },
        ],
      };
    }
  }

  const domain = {
    name: "binance reward vault",
    version: "0.1.0",
    chainId,
    verifyingContract,
  };

  const signature = await signer.signTypedData(domain, types, value);
  return signature;
}

export function getTxCostInETH(txRecipt: {
  gasUsed: bigint;
  gasPrice: bigint;
}) {
  return txRecipt.gasUsed * txRecipt.gasPrice;
}
