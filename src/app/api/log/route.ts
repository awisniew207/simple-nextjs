import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  LitAccessControlConditionResource,
  LitAbility,
  createSiweMessage,
  generateAuthSig,
  LitActionResource,
} from '@lit-protocol/auth-helpers';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
const LIT_NETWORK = LitNetwork.Datil;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicKey } = body as { publicKey: string };
    const provider = new ethers.providers.StaticJsonRpcProvider({
      url: LIT_RPC.CHRONICLE_YELLOWSTONE,
      skipFetchSetup: true,
    });

    const walletWithCapacityCredit = new ethers.Wallet(process.env.LIT_PRIVATE_KEY || '', provider);

    console.log('walletWithCapacityCredit', walletWithCapacityCredit.address);

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
    }

    // console.log('litNodeClient', litNodeClient);
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();

    // give this thing a few times to retry
    // const maxRetries = 3;
    // let retries = 0;
    // while (retries < maxRetries) {
    // try {
    // console.log('connected to lit node client');
    // break;
    // } catch (error) {
    // console.error(
    // `Failed to connect to lit node client. Attempt ${retries + 1} of ${maxRetries}`,
    // litNodeClient.connectedNodes
    // );
    // retries++;
    // if (retries === maxRetries) {
    //  throw new Error('Failed to connect to lit node client after multiple attempts');
    // }
    // Wait for a short time before retrying
    // await new Promise(resolve => setTimeout(resolve, 1_000));
    // }
    console.log('connected to lit node client');

    const { capacityDelegationAuthSig } = await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: walletWithCapacityCredit,
      capacityTokenId: '23955',
      delegateeAddresses: [walletWithCapacityCredit.address],
    });
    console.log('capacityDelegationAuthSig', capacityDelegationAuthSig);

    // Get the session signatures
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      capacityDelegationAuthSig,
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource('*'),
          ability: LitAbility.AccessControlConditionDecryption,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }: {
        uri?: string;
        expiration?: string;
        resourceAbilityRequests?: LitResourceAbilityRequest[];
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await walletWithCapacityCredit.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: walletWithCapacityCredit,
          toSign,
        });
      },
    });
    console.log('sessionSigs', sessionSigs);

    return NextResponse.json(
      { message: 'Session signatures generated successfully', sessionSigs },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating session signatures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
