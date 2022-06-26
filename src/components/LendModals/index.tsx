import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Input } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import { ArrowForward } from '@material-ui/icons';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import { midUsdFormatter } from 'utils/bigUtils';

import * as MarketUtils from 'utils/marketxyz';
import { convertMantissaToAPR, convertMantissaToAPY } from 'utils/marketxyz';

import { getEthPrice } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { ToggleSwitch, CustomModal, ButtonSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import ModalBackSvg from '../../assets/images/resource/loadingmodalback.svg';
import SpinnerImage from '../../assets/images/resource/spinner.svg';
import SuccessImage from '../../assets/images/resource/success.svg';
import 'components/styles/LendModal.scss';

interface QuickModalContentProps {
  confirm?: boolean;
  withdraw?: boolean;
  borrow?: boolean;
  asset: USDPricedPoolAsset;
  borrowLimit: number;
  open: boolean;
  onClose: () => void;
}
export const QuickModalContent: React.FC<QuickModalContentProps> = ({
  confirm,
  withdraw,
  borrow,
  asset,
  borrowLimit,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const [inputFocused, setInputFocused] = useState(false);
  const [isRepay, setisRepay] = useState(confirm ? true : false);
  const [modalType, setModalType] = useState(borrow ? 'borrow' : 'supply');
  const [value, setValue] = useState('');
  const [enableAsCollateral, setEnableAsCollateral] = useState<boolean>(false);
  const isWithdraw = modalType === 'withdraw';
  const buttonDisabled = !account || Number(value) <= 0;
  const buttonText = useMemo(() => {
    if (!account) {
      return t('connectWallet');
    } else if (Number(value) <= 0) {
      return t('enterAmount');
    }
    return t('confirm');
  }, [account, t, value]);

  const [ethPrice, setEthPrice] = useState<number>();

  useEffect(() => {
    getEthPrice().then(([price]) => setEthPrice(price));
  }, []);

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box className='lendModalWrapper'>
        <ButtonSwitch
          height={56}
          padding={6}
          value={modalType}
          onChange={setModalType}
          items={[
            {
              label: borrow ? t('borrow') : t('supply'),
              value: borrow ? 'borrow' : 'supply',
            },
            {
              label: borrow ? t('repay') : t('withdraw'),
              value: borrow ? 'repay' : 'withdraw',
            },
          ]}
        />
        <Box mt={'24px'} className='flex justify-between items-center'>
          <span className='text-secondary text-uppercase'>
            {!borrow ? t('supplyAmount') : t('borrowAmount')}
          </span>
          {(modalType === 'supply' || modalType === 'repay') && (
            <p className='caption text-secondary'>
              {withdraw ? t('supplied') : t('balance')}:{' '}
              {(
                Number(asset.underlyingBalance.toString()) /
                10 ** Number(asset.underlyingDecimals.toString())
              ).toLocaleString()}{' '}
              {asset.underlyingSymbol}
            </p>
          )}
        </Box>
        <Box
          mt={2}
          className={`lendModalInput ${inputFocused ? 'focused' : ''}`}
        >
          <Box>
            <Input
              type={'text'}
              disableUnderline={true}
              placeholder={'0.00'}
              value={value}
              onChange={(e) => {
                setValue(e.currentTarget.value);
              }}
            />
            <p className='span text-secondary'>
              (
              {ethPrice
                ? midUsdFormatter(
                    ((Number(asset.underlyingPrice.toString()) /
                      10 ** Number(asset.underlyingDecimals.toString()) /
                      10 ** 17) *
                      Number(value)) /
                      ethPrice,
                  )
                : '?'}
              )
            </p>
          </Box>
          <Box
            className='lendMaxButton'
            onClick={() => {
              setValue(
                (
                  Number(asset.underlyingBalance.toString()) /
                  10 ** asset.underlyingDecimals.toNumber()
                ).toString(),
              );
            }}
          >
            {t('max')}
          </Box>
        </Box>
        <Box my={3} className='lendModalContentWrapper'>
          {!borrow ? (
            <>
              <Box className='lendModalRow'>
                <p>{t('suppliedBalance')}:</p>
                <p>
                  {!confirm ? (
                    (
                      Number(asset.supplyBalance.toString()) /
                      10 ** Number(asset.underlyingDecimals.toString())
                    ).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol
                  ) : (
                    <>
                      {(
                        Number(asset.supplyBalance.toString()) /
                        10 ** Number(asset.underlyingDecimals.toString())
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                      <ArrowForward fontSize='small' />
                      {(
                        Number(asset.supplyBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString()) +
                        Number(value)
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                    </>
                  )}
                </p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('supplyapy')}:</p>
                <p>{convertMantissaToAPY(asset.supplyRatePerBlock, 365)}%</p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('borrowLimit')}:</p>
                <p>
                  {!confirm ? (
                    midUsdFormatter(borrowLimit)
                  ) : (
                    <>
                      {midUsdFormatter(borrowLimit)}
                      <ArrowForward fontSize='small' />
                      {midUsdFormatter(borrowLimit - Number(value))}
                    </>
                  )}
                </p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('totalDebtBalance')}:</p>
                <p>{midUsdFormatter(asset.borrowBalanceUSD)}</p>
              </Box>
            </>
          ) : (
            <>
              <Box className='lendModalRow'>
                <p>{t('borrowedBalance')}:</p>
                <p>
                  {!confirm ? (
                    (
                      Number(asset.borrowBalance.toString()) /
                      10 ** Number(asset.underlyingDecimals.toString())
                    ).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol
                  ) : (
                    <>
                      {(
                        Number(asset.borrowBalance.toString()) /
                        10 ** Number(asset.underlyingDecimals.toString())
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                      <ArrowForward fontSize='small' />
                      {(
                        Number(asset.borrowBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString()) +
                        Number(value)
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                    </>
                  )}
                </p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('suppliedBalance')}:</p>
                <p>
                  {!confirm ? (
                    (
                      Number(asset.supplyBalance.toString()) /
                      10 ** Number(asset.underlyingDecimals.toString())
                    ).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol
                  ) : (
                    <>
                      {(
                        Number(asset.supplyBalance.toString()) /
                        10 ** Number(asset.underlyingDecimals.toString())
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                      <ArrowForward fontSize='small' />
                      {(
                        Number(asset.supplyBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString()) +
                        Number(value)
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                    </>
                  )}
                </p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('borrowAPR')}:</p>
                <p>{convertMantissaToAPR(asset.borrowRatePerBlock)}%</p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('borrowLimit')}:</p>
                <p>{midUsdFormatter(borrowLimit)}</p>
              </Box>
              <Box className='lendModalRow'>
                <p>{t('totalDebtBalance')}:</p>
                <p>
                  {!confirm ? (
                    (
                      Number(asset.borrowBalance.toString()) /
                      10 ** Number(asset.underlyingDecimals.toString())
                    ).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol
                  ) : (
                    <>
                      {(
                        Number(asset.borrowBalance.toString()) /
                        10 ** Number(asset.underlyingDecimals.toString())
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                      <ArrowForward fontSize='small' />
                      {(
                        Number(asset.borrowBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString()) +
                        Number(value)
                      ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol}
                    </>
                  )}
                </p>
              </Box>
            </>
          )}
        </Box>
        {!borrow && !isWithdraw && (
          <Box className='lendModalContentWrapper'>
            <Box className='lendModalRow'>
              <p>{t('enableAsCollateral')}</p>
              <ToggleSwitch
                toggled={enableAsCollateral}
                onToggle={() => {
                  setEnableAsCollateral(
                    (enableAsCollateral) => !enableAsCollateral,
                  );
                }}
              />
            </Box>
          </Box>
        )}
        <Box mt={'24px'}>
          <Button
            fullWidth
            disabled={buttonDisabled}
            onClick={() => {
              if (!account) return;
              if (borrow) {
                if (isRepay) {
                  MarketUtils.repayBorrow(asset, Number(value), account);
                } else {
                  MarketUtils.borrow(asset, Number(value), account);
                }
              } else {
                if (isWithdraw) {
                  MarketUtils.withdraw(asset, Number(value), account);
                } else {
                  MarketUtils.supply(
                    asset,
                    Number(value),
                    account,
                    enableAsCollateral,
                  );
                }
              }
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};
interface StateModalContentProps {
  loading?: boolean;
  setOpenModalType?: any;
}
export const StateModalContent: React.FC<StateModalContentProps> = ({
  loading,
  setOpenModalType,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(loading ? true : false);
  useEffect(() => {
    window.setTimeout(() => {
      isLoading && setIsLoading(false);
    }, 3000);
  }, [isLoading]);
  return (
    <>
      {isLoading ? (
        <Box position={'relative'} width={'369px'}>
          <img src={ModalBackSvg} alt='Modal back' />
          <Box
            position={'absolute'}
            top={'0px'}
            left={'0px'}
            width={'100%'}
            height={'100%'}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            gridGap={'32px'}
          >
            <Spinner>
              <img src={SpinnerImage} alt='Spinner' />
            </Spinner>
            <Box fontSize={'18px'} fontWeight={'500'} color={'#c7cad9'}>
              Confirm transaction in your wallet
            </Box>
          </Box>
        </Box>
      ) : (
        <Box width={'480px'} display={'flex'} flexDirection={'column'}>
          <Box
            mt={'60px'}
            marginX={'auto'}
            position={'relative'}
            width={'369px'}
          >
            <img src={ModalBackSvg} alt='modalBack' />
            <Box
              position={'absolute'}
              top={'0px'}
              left={'0px'}
              width={'100%'}
              height={'100%'}
              display={'flex'}
              flexDirection={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              gridGap={'23px'}
            >
              <Box>
                <img src={SuccessImage} alt='Success' />
              </Box>
              <Box fontSize={'18px'} fontWeight={'500'} color={'#c7cad9'}>
                {t('txSubmitted')}
              </Box>
            </Box>
          </Box>
          <Box p={'6px'} mt={'100px'} display={'flex'} borderRadius={'8px'}>
            <Box
              flex={1}
              margin={'0 6px 0 0'}
              paddingY={'12px'}
              borderRadius={'6px'}
              bgcolor={'#282d3d'}
              color={'#696c80'}
              fontSize={'16px'}
              fontWeight={'500'}
              textAlign={'center'}
              style={{ cursor: 'pointer' }}
            >
              View transaction
            </Box>
            <Box
              flex={1}
              margin={'0 6px 0 0'}
              paddingY={'12px'}
              borderRadius={'6px'}
              bgcolor={'#282d3d'}
              color={'#696c80'}
              fontSize={'16px'}
              fontWeight={'500'}
              textAlign={'center'}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setOpenModalType(false);
              }}
            >
              Close
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

const Spinner = styled.div`
  display: flex;
  animation: ${keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `} 1s infinite linear;
`;

interface IconProps {
  size?: any;
  color?: any;
}
const LogoIcon: React.FC<IconProps> = ({
  size = '1em',
  color = 'currentColor',
}) => {
  return (
    <svg
      data-name='Group 20365'
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 32 32'
    >
      <defs>
        <linearGradient
          id='vv1wd4liga'
          x1='.5'
          x2='.5'
          y2='1'
          gradientUnits='objectBoundingBox'
        >
          <stop offset='0' stopColor='#2464f4' />
          <stop offset='1' stopColor='#1db2d5' />
        </linearGradient>
      </defs>
      <circle data-name='Ellipse 528' cx='16' cy='16' r='16' fill='#fff' />
      <path
        data-name='Path 11312'
        d='M766.127 725.606z'
        transform='translate(-749.447 -720.376)'
        fill='url(#vv1wd4liga)'
        opacity='0.3'
      />
      <path
        data-name='Path 11314'
        d='M765.979 725.607z'
        transform='translate(-749.318 -720.376)'
        opacity='0.4'
        fill='url(#vv1wd4liga)'
      />
      <g data-name='Group 15189'>
        <path
          data-name='Path 11311'
          d='M592.8 579.893a13.021 13.021 0 0 0-3.863-2.694 3.639 3.639 0 0 0 .364-1.257l-.063-.027a10.232 10.232 0 0 1-.685 1.126 14.023 14.023 0 0 1-.9 1.164l.741.008c-.939 1.966-3.607 2.826-3.607 2.826-.007.608-.935 1.683-.935 1.683a9.782 9.782 0 0 0 2.97-1.446c6.388.294 7.947 4.035 8.384 4.741.062.1.013.194 0 .179-1.434-2.208-3.5-2.936-3.636-2.807l.676.833a15.161 15.161 0 0 0-5.379-1.451s4.436.772 6.864 3.951a12.082 12.082 0 0 1 2.356 5.392c.015.106.024.19.028.249a13.022 13.022 0 0 0 .437-3.275 12.864 12.864 0 0 0-3.752-9.195zm-6.932-3.646-.185-.032-.16-.026h-.023l-.285-.04h-.019l-.158-.019q-.154-.017-.308-.031h-.037l-.117-.009q-.183-.014-.367-.024a8.606 8.606 0 0 0-.321-.012h-.51c-.165 0-.33.007-.494.016l-.163.009a13.009 13.009 0 0 0-11.733 9.578 13.145 13.145 0 0 0-.433 3.38 4.881 4.881 0 0 0 .04.749 2.232 2.232 0 0 0 .075.326c0 .012.007.024.01.036a8.95 8.95 0 0 0 .881 1.884 10.086 10.086 0 0 0 .736 1.114 5.147 5.147 0 0 0 .361.442l.039.043.047.052c.045.049.091.1.137.146l.03.031a8.32 8.32 0 0 0 2.284 1.626 11 11 0 0 0 4.158 1.084 10.028 10.028 0 0 0 1.506-.011h.075a6.185 6.185 0 0 0 1.587-.334 3.789 3.789 0 0 0 1.192-.62 4.634 4.634 0 0 0 1.142-1.216 4.343 4.343 0 0 0 .72-2.288c.023-1.892-1.869-4.023-4.6-4.271a5.7 5.7 0 0 0-.265-.018h-.508l-.147.007-.126.009-.111.01a4.2 4.2 0 0 0-.222.027q-.284.038-.574.1c-1.78.408-1.161 1.835-1.141 1.882a5.805 5.805 0 0 1-1.237-.25l-.018-.006-.079-.027a3.38 3.38 0 0 1-1.162-.685h-.005l-.032-.031a3.172 3.172 0 0 1-.557-.735h-.005a8.372 8.372 0 0 0-.712.5 9.3 9.3 0 0 1-.106-2.769c.216-1.046 1.881-2.3 1.881-2.3s-.208 1.074.747 1.084 2.068-1.491 2.111-1.361.913.142.913.142-.392 0-.732-.7.718-1.729 2.468-2.36a8.988 8.988 0 0 0 3.12-2.135c.435.049.552 1.266.552 1.266a13.444 13.444 0 0 0 3.084-2.59 12.871 12.871 0 0 0-2.247-.643zm-4.523 5.52c-.89.346-.778.96-.778.96a2.4 2.4 0 0 0 1.453-.289 2.782 2.782 0 0 0 1.092-1.5 16.74 16.74 0 0 1-1.77.83zm1.126 3.247zm-6.843.157c-.267-.09-.616.224-.779.7a1.375 1.375 0 0 0-.073.631 1.551 1.551 0 0 1 .068-.28c.163-.479.512-.793.779-.7a.457.457 0 0 1 .26.4c.051-.366-.045-.678-.258-.75zm5.717-3.4c-.89.346-.778.96-.778.96a2.4 2.4 0 0 0 1.453-.289 2.782 2.782 0 0 0 1.092-1.5 16.74 16.74 0 0 1-1.77.826zm-5.717 3.4c-.267-.09-.616.224-.779.7a1.375 1.375 0 0 0-.073.631 1.551 1.551 0 0 1 .068-.28c.163-.479.512-.793.779-.7a.457.457 0 0 1 .26.4c.051-.366-.045-.678-.258-.75zm5.717-3.4c-.89.346-.778.96-.778.96a2.4 2.4 0 0 0 1.453-.289 2.782 2.782 0 0 0 1.092-1.5 16.74 16.74 0 0 1-1.77.826zm1.126 3.247zm-6.843.157c-.267-.09-.616.224-.779.7a1.375 1.375 0 0 0-.073.631 1.551 1.551 0 0 1 .068-.28c.163-.479.512-.793.779-.7a.457.457 0 0 1 .26.4c.051-.37-.045-.682-.258-.754z'
          transform='translate(-567.551 -572.915)'
          fill='#448aff'
        />
        <g data-name='Group 15188'>
          <path
            data-name='Path 11313'
            d='M592.055 738.968a8.074 8.074 0 0 1-4.692 2.987q-.492.1-.991.166l-.133.016-.127.014h-.039a15.133 15.133 0 0 1-6.821-.945 11.207 11.207 0 0 1-2.163-1.116 13.212 13.212 0 0 1-2.011-1.666 14.45 14.45 0 0 1-3.717-8.348 2.358 2.358 0 0 0 .075.327 8.807 8.807 0 0 0 .892 1.92 10.2 10.2 0 0 0 .735 1.114 5.3 5.3 0 0 0 .361.441l.039.043.048.053q.067.074.137.146l.03.031a8.309 8.309 0 0 0 2.284 1.626 11 11 0 0 0 4.158 1.085 10.06 10.06 0 0 0 1.506-.011h.075a6.205 6.205 0 0 0 1.587-.335 3.765 3.765 0 0 0 1.192-.62 4.639 4.639 0 0 0 1.141-1.216 4.351 4.351 0 0 0 .721-2.289c.024-2.026-2.146-4.326-5.191-4.3-.069 0-.138 0-.207.006h-.146l-.142.011a4.727 4.727 0 0 0-.236.026h-.018c-.2.027-.4.063-.6.109-1.04.238-1.261.825-1.261 1.281a1.609 1.609 0 0 0 .121.6h-.009a5.86 5.86 0 0 1-1.237-.25l-.019-.006-.079-.027a3.368 3.368 0 0 1-1.162-.686h-.006l-.031-.03a2.975 2.975 0 0 1-.32-.366 3.613 3.613 0 0 1-.238-.37 10.944 10.944 0 0 1 5.433-1.679l.2-.008q.406-.012.815 0 .643.02 1.289.1a10.733 10.733 0 0 1 1.923.4h.007v-.005h.005a4.452 4.452 0 0 0-.557-.782c-.265-.308-.959-1.117-1.42-1.11l.135-.008q.423-.021.852 0a9.788 9.788 0 0 1 7.234 3.506l.035.037.042.055a10.341 10.341 0 0 1 1.269 2.192 12.4 12.4 0 0 1 .643 2.866 6.954 6.954 0 0 1-1.411 5.015z'
            transform='translate(-568.31 -713.223)'
            fill='#303f9f'
          />
          <path
            data-name='Path 11315'
            d='M656.577 738.968a8.073 8.073 0 0 1-4.692 2.987q-.492.1-.991.166l-.133.016-.127.014h-.039c-.09.009-.179.017-.27.024a14.48 14.48 0 0 1-2.651-.036 11.46 11.46 0 0 1-3.9-.932l-.1-.053c.166-.008.337 0 .505 0a9.02 9.02 0 0 0 6-2.371 8.142 8.142 0 0 0 2.856-5.93c0-.231-.011-.466-.032-.7l-.01-.107-.044.1a4.563 4.563 0 0 1-2.81 2.525l-.029.009a4.014 4.014 0 0 0 .56-1.181 4.329 4.329 0 0 0 .18-1.116c.023-1.933-1.954-4.116-4.78-4.286h-.038l-.151-.006h-.567l-.143.011a4.86 4.86 0 0 0-.236.026h-.018c-.2.026-.406.063-.614.11-1.779.407-1.161 1.835-1.139 1.882a3.524 3.524 0 0 1-3.1-1.741 10.946 10.946 0 0 1 5.442-1.679l.2-.008q.406-.012.815 0 .639.021 1.281.1a10.526 10.526 0 0 1 1.93.4h.006a4.536 4.536 0 0 0-.557-.782c-.263-.306-.952-1.107-1.412-1.11h-.012c.048 0 .1-.006.145-.008q.424-.021.852 0a9.789 9.789 0 0 1 7.226 3.506l.035.037.051.055a6.478 6.478 0 0 1 1.269 2.192 12.406 12.406 0 0 1 .643 2.866 6.953 6.953 0 0 1-1.401 5.02z'
            transform='translate(-632.832 -713.223)'
            fill='#1a237e'
            opacity='0.7'
          />
        </g>
      </g>
    </svg>
  );
};