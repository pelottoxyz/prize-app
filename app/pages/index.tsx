import { ConnectButton } from '@rainbow-me/rainbowkit'
import { BigNumber } from 'ethers'
import type { NextPage } from 'next'
import Head from 'next/head'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT;

function PassPreview({tokenId}: {tokenId: BigNumber}) {
  const { data, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "generatePass",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
    ],
    functionName: 'generatePass',
    args: [tokenId]
  })

  if (!data) return null;

  return (
    <div style={{ margin: 24 }}>
      <img src={data.toString()} width={350} height={350} alt="Preview" />
    </div>
  )
}

const Home: NextPage = () => {
  const { isConnected } = useAccount()
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'mint',
  })

  const {
    data: mintData,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    write: mint,
  } = useContractWrite(config)

  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const { data: totalSupplyData, isSuccess: totalSupplySuccess } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
    ],
    functionName: 'totalSupply'
  })

  const isMinted = txSuccess;

  return (
    <div style={{ padding: 24 }}>
      <Head>
        <title>Pelotto</title>
        <meta name="description" content="Building" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ConnectButton />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'column',
        marginTop: 48
      }}>

        <p style={{ height: 48 }}>
          {totalSupplyData && <span>{totalSupplyData.toString()} minted so far!</span>}
        </p>

        {!isConnected && <p>Please, connect your wallet to mint.</p>}

        {isConnected && !isMinted && (
          <p>
            <button
              disabled={isMintLoading || isMintStarted}
              data-mint-loading={isMintLoading}
              data-mint-started={isMintStarted}
              onClick={() => mint && mint()}
            >
              {isMintLoading && 'Waiting for approval'}
              {isMintStarted && 'Minting...'}
              {!isMintLoading && !isMintStarted && 'Mint Pass'}
            </button>
          </p>
        )}

        {isMinted && (
          <div style={{ padding: 24 }}>
            <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
            <p style={{ marginBottom: 24 }}>
              Your NFT will show up in your wallet in the next few minutes.
            </p>
            <p style={{ marginBottom: 6 }}>
              View on{' '}
              <a href={`https://mumbai.polygonscan.com/tx/${mintData?.hash}`}>
                polygonscan
              </a>
            </p>
          </div>
        )}

        {isMinted && totalSupplyData && totalSupplySuccess && (
          <PassPreview tokenId={totalSupplyData} />
        )}
      </div>
    </div>
  )
}

export default Home
