import { useEffect, useState } from 'react'
import { StakeConnection, StakeAccount, PythBalance } from 'pyth-staking-api'
import { BN, Wallet } from '@project-serum/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'

const useStakeConnection = (
  connected: boolean,
  wallet: SignerWalletAdapter,
  connection: Connection
) => {
  const [stakeConnection, setStakeConnection] = useState<StakeConnection>()
  const [stakeAccount, setStakeAccount] = useState<StakeAccount>()
  const [voterWeight, setVoterWeight] = useState<PythBalance>(
    new PythBalance(new BN(0))
  )

  useEffect(() => {
    const createStakeConnection = async () => {
      if (wallet?.publicKey) {
        try {
          const sc = await StakeConnection.createStakeConnection(
            connection,
            (wallet as unknown) as Wallet,
            new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
          )
          const stakeAccounts = await sc.getStakeAccounts(wallet?.publicKey)
          if (stakeAccounts.length > 0) {
            setStakeAccount(stakeAccounts[0])
            setVoterWeight(stakeAccounts[0].getVoterWeight(await sc.getTime()))
          }
          setStakeConnection(sc)
        } catch (e) {
          console.error(e)
        }
      }
    }
    if (!connected) {
      setStakeConnection(undefined)
      setStakeAccount(undefined)
    } else {
      createStakeConnection()
    }
  }, [connected])

  //   useEffect(() => {
  //     const price = tokenService.getUSDTokenPrice(mintAddress)
  //     const totalPrice = amount * price
  //     const totalPriceFormatted = amount
  //       ? new BigNumber(totalPrice).toFormat(0)
  //       : ''
  //     setTotalValue(totalPriceFormatted)
  //   }, [amount, mintAddress])

  //   return totalValue
  return { stakeConnection, stakeAccount, voterWeight }
}
export default useStakeConnection
