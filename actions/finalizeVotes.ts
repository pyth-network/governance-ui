import {
  getGovernanceProgramVersion,
  ProgramAccount,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import { Proposal } from '@solana/spl-governance'
import { withFinalizeVote } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'

export const finalizeVote = async (
  { connection, wallet, programId }: RpcContext,
  realm: PublicKey,
  proposal: ProgramAccount<Proposal>,
  maxVoterWeightPk: PublicKey | undefined,
  client?: VotingClient
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )
  // Some plugins may need to update the max voter weight record prior to finalizing
  await client?.withUpdateVoterWeightRecord(
    instructions,
    'castVote' /* finalize is not a type */
  )

  await withFinalizeVote(
    instructions,
    programId,
    programVersion,
    realm,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    proposal.account.governingTokenMint,
    maxVoterWeightPk
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Finalizing votes',
    successMessage: 'Votes finalized',
  })
}
