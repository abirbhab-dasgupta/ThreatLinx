import { describe,it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

                                                                               
const {viem}=await network.create();

describe("ThreatReportRegistry",()=>{
  it("registers a version once and returns an independently readable digest",async()=>{
    const [publisher]=await viem.getWalletClients();
    const contract=await viem.deployContract("ThreatReportRegistry",[publisher.account.address]);
    const key=`0x${"11".repeat(32)}` as const;
    const digest=`0x${"22".repeat(32)}` as const;
    await contract.write.publish([key,1n,digest]);
    assert.equal(await contract.read.getCommitment([key,1n]),digest);
    await assert.rejects(contract.write.publish([key,1n,digest]));
  });
  it("rejects zero/invalid commitments",async()=>{
    const [publisher]=await viem.getWalletClients();
    const contract=await viem.deployContract("ThreatReportRegistry",[publisher.account.address]);
    const zero=`0x${"00".repeat(32)}` as const;
    await assert.rejects(contract.write.publish([zero,1n,zero]));
  });
  it("rejects publication from an unauthorised wallet",async()=>{
    const [publisher,outsider]=await viem.getWalletClients();
    const contract=await viem.deployContract("ThreatReportRegistry",[publisher.account.address]);
    const key=`0x${"33".repeat(32)}` as const;
    const digest=`0x${"44".repeat(32)}` as const;
    await assert.rejects(contract.write.publish([key,1n,digest],{account:outsider.account}));
  });
});
