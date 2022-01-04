import { WETH } from '@uniswap/sdk';

import { DAI, ICE, QUICK, SAND, USDC, USDT, WBTC } from 'constants/index';
import { MetaToken } from './types';

import usdcABI from 'constants/abis/usdc.json';
import tokenABI from 'constants/abis/meta_token.json';
import quickABI from 'constants/abis/quick.json';
import sandABI from 'constants/abis/sand.json';

import { EIP712TypeOneApproveStrategy } from './approveStrategies/EIP712TypeOneApproveStrategy';
import { EIP712TypeTwoApproveStrategyFactory } from './approveStrategies/EIP712TypeTwoApproveStrategy';
import { PermitOnlyApproveStrategyFactory } from './approveStrategies/PermitOnlyApproveStrategy';
import { EIP2771ApproveStrategy } from './approveStrategies/EIP2771ApproveStrategy';

const MetaUSDC = new MetaToken(USDC, usdcABI, EIP712TypeOneApproveStrategy);

//TODO //review
const MetaWETH = new MetaToken(
  WETH[137],
  tokenABI,
  EIP712TypeOneApproveStrategy,
);

const MetaUSDT = new MetaToken(USDT, tokenABI, EIP712TypeOneApproveStrategy);

const MetaWBTC = new MetaToken(WBTC, tokenABI, EIP712TypeOneApproveStrategy);

const MetaDAI = new MetaToken(DAI, tokenABI, EIP712TypeOneApproveStrategy);

//Marked for Deletion
const MetaICE = new MetaToken(
  ICE,
  tokenABI,
  EIP712TypeTwoApproveStrategyFactory(),
);

const MetaQUICK = new MetaToken(
  QUICK,
  quickABI,
  PermitOnlyApproveStrategyFactory(),
);

const MetaSAND = new MetaToken(SAND, sandABI, EIP2771ApproveStrategy);

export default [
  MetaUSDC,
  MetaWETH,
  MetaUSDT,
  MetaWBTC,
  MetaDAI,
  MetaICE, //Marked for Deletion
  MetaQUICK,
  MetaSAND,
];