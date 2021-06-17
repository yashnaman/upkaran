// eslint-disable @typescript-eslint/no-explicit-any
import { Fixture } from "ethereum-waffle";

import { Signers } from "./";
import { StrategySCrvYCrv } from "../typechain/StrategySCrvYCrv";

declare module "mocha" {
  export interface Context {
    strategy: StrategySCrvYCrv;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}
