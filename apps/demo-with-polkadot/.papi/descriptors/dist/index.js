import { _Enum } from 'polkadot-api';

const table = new Uint8Array(128);
for (let i = 0; i < 64; i++) table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
const toBinary = (base64) => {
  const n = base64.length, bytes = new Uint8Array((n - Number(base64[n - 1] === "=") - Number(base64[n - 2] === "=")) * 3 / 4 | 0);
  for (let i2 = 0, j = 0; i2 < n; ) {
    const c0 = table[base64.charCodeAt(i2++)], c1 = table[base64.charCodeAt(i2++)];
    const c2 = table[base64.charCodeAt(i2++)], c3 = table[base64.charCodeAt(i2++)];
    bytes[j++] = c0 << 2 | c1 >> 4;
    bytes[j++] = c1 << 4 | c2 >> 2;
    bytes[j++] = c2 << 6 | c3;
  }
  return bytes;
};

const descriptorValues = import('./descriptors-BJKfQ_kq.js').then((module) => module["Paseo"]);
const metadataTypes = import('./metadataTypes-DwqYcNwq.js').then(
  (module) => toBinary("default" in module ? module.default : module)
);
const asset = {};
const extensions = {};
const getMetadata$1 = () => import('./paseo_metadata-BvOfU8Ms.js').then(
  (module) => toBinary("default" in module ? module.default : module)
);
const genesis = "0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f";
const _allDescriptors = { descriptors: descriptorValues, metadataTypes, asset, extensions, getMetadata: getMetadata$1, genesis };

const DigestItem = _Enum;
const Phase = _Enum;
const DispatchClass = _Enum;
const TokenError = _Enum;
const ArithmeticError = _Enum;
const TransactionalError = _Enum;
const PreimageEvent = _Enum;
const BalanceStatus = _Enum;
const PreimagePalletHoldReason = _Enum;
const TransactionPaymentEvent = _Enum;
const StakingRewardDestination = _Enum;
const StakingForcing = _Enum;
const OffencesEvent = _Enum;
const GrandpaEvent = _Enum;
const XcmV3Junctions = _Enum;
const XcmV3Junction = _Enum;
const XcmV3JunctionNetworkId = _Enum;
const XcmV3JunctionBodyId = _Enum;
const XcmV2JunctionBodyPart = _Enum;
const XcmV3MultiassetAssetId = _Enum;
const XcmV5Junctions = _Enum;
const XcmV5Junction = _Enum;
const XcmV5NetworkId = _Enum;
const XcmVersionedLocation = _Enum;
const ConvictionVotingVoteAccountVote = _Enum;
const PreimagesBounded = _Enum;
const CommonClaimsEvent = _Enum;
const ChildBountiesEvent = _Enum;
const ElectionProviderMultiPhaseEvent = _Enum;
const ElectionProviderMultiPhaseElectionCompute = _Enum;
const ElectionProviderMultiPhasePhase = _Enum;
const BagsListEvent = _Enum;
const NominationPoolsPoolState = _Enum;
const NominationPoolsCommissionClaimPermission = _Enum;
const NominationPoolsClaimPermission = _Enum;
const ParachainsHrmpEvent = _Enum;
const ParachainsDisputesEvent = _Enum;
const ParachainsDisputeLocation = _Enum;
const ParachainsDisputeResult = _Enum;
const CommonParasRegistrarEvent = _Enum;
const CommonSlotsEvent = _Enum;
const CommonAuctionsEvent = _Enum;
const PolkadotRuntimeParachainsCoretimeEvent = _Enum;
const XcmV5Instruction = _Enum;
const XcmV3MultiassetFungibility = _Enum;
const XcmV3MultiassetAssetInstance = _Enum;
const XcmV3MaybeErrorCode = _Enum;
const XcmV2OriginKind = _Enum;
const XcmV5AssetFilter = _Enum;
const XcmV5WildAsset = _Enum;
const XcmV2MultiassetWildFungibility = _Enum;
const XcmV3WeightLimit = _Enum;
const XcmVersionedAssets = _Enum;
const ParachainsInclusionAggregateMessageOrigin = _Enum;
const ParachainsInclusionUmpQueueId = _Enum;
const ParachainsOrigin = _Enum;
const PreimageOldRequestStatus = _Enum;
const PreimageRequestStatus = _Enum;
const BabeDigestsNextConfigDescriptor = _Enum;
const BabeAllowedSlots = _Enum;
const BabeDigestsPreDigest = _Enum;
const BalancesTypesReasons = _Enum;
const WestendRuntimeRuntimeFreezeReason = _Enum;
const NominationPoolsPalletFreezeReason = _Enum;
const TransactionPaymentReleases = _Enum;
const GrandpaStoredState = _Enum;
const TreasuryPaymentState = _Enum;
const ConvictionVotingVoteVoting = _Enum;
const VotingConviction = _Enum;
const TraitsScheduleDispatchTime = _Enum;
const ClaimsStatementKind = _Enum;
const Version = _Enum;
const ChildBountyStatus = _Enum;
const PolkadotPrimitivesV6PvfPrepKind = _Enum;
const PvfExecKind = _Enum;
const ValidityAttestation = _Enum;
const PolkadotPrimitivesV6DisputeStatement = _Enum;
const PolkadotPrimitivesV6ValidDisputeStatementKind = _Enum;
const InvalidDisputeStatementKind = _Enum;
const BrokerCoretimeInterfaceCoreAssignment = _Enum;
const ParachainsParasParaLifecycle = _Enum;
const UpgradeGoAhead = _Enum;
const UpgradeRestriction = _Enum;
const CommonCrowdloanLastContribution = _Enum;
const XcmV3Response = _Enum;
const XcmV3TraitsError = _Enum;
const XcmV4Response = _Enum;
const XcmPalletVersionMigrationStage = _Enum;
const XcmVersionedAssetId = _Enum;
const ReferendaTypesCurve = _Enum;
const MultiAddress = _Enum;
const BalancesAdjustmentDirection = _Enum;
const StakingPalletConfigOpBig = _Enum;
const StakingPalletConfigOp = _Enum;
const GrandpaEquivocation = _Enum;
const NominationPoolsBondExtra = _Enum;
const NominationPoolsConfigOp = _Enum;
const XcmVersionedXcm = _Enum;
const XcmV3Instruction = _Enum;
const XcmV3MultiassetMultiAssetFilter = _Enum;
const XcmV3MultiassetWildMultiAsset = _Enum;
const XcmV4Instruction = _Enum;
const XcmV4AssetAssetFilter = _Enum;
const XcmV4AssetWildAsset = _Enum;
const TransactionValidityUnknownTransaction = _Enum;
const TransactionValidityTransactionSource = _Enum;
const OccupiedCoreAssumption = _Enum;
const SlashingOffenceKind = _Enum;
const MmrPrimitivesError = _Enum;

const metadatas = { ["0x78abd479e98f6160fc03a2377aa083c10dac2304ca348b3e9620c1dc61cfa0a3"]: _allDescriptors };
const getMetadata = async (codeHash) => {
  try {
    return await metadatas[codeHash].getMetadata();
  } catch {
  }
  return null;
};

export { ArithmeticError, BabeAllowedSlots, BabeDigestsNextConfigDescriptor, BabeDigestsPreDigest, BagsListEvent, BalanceStatus, BalancesAdjustmentDirection, BalancesTypesReasons, BrokerCoretimeInterfaceCoreAssignment, ChildBountiesEvent, ChildBountyStatus, ClaimsStatementKind, CommonAuctionsEvent, CommonClaimsEvent, CommonCrowdloanLastContribution, CommonParasRegistrarEvent, CommonSlotsEvent, ConvictionVotingVoteAccountVote, ConvictionVotingVoteVoting, DigestItem, DispatchClass, ElectionProviderMultiPhaseElectionCompute, ElectionProviderMultiPhaseEvent, ElectionProviderMultiPhasePhase, GrandpaEquivocation, GrandpaEvent, GrandpaStoredState, InvalidDisputeStatementKind, MmrPrimitivesError, MultiAddress, NominationPoolsBondExtra, NominationPoolsClaimPermission, NominationPoolsCommissionClaimPermission, NominationPoolsConfigOp, NominationPoolsPalletFreezeReason, NominationPoolsPoolState, OccupiedCoreAssumption, OffencesEvent, ParachainsDisputeLocation, ParachainsDisputeResult, ParachainsDisputesEvent, ParachainsHrmpEvent, ParachainsInclusionAggregateMessageOrigin, ParachainsInclusionUmpQueueId, ParachainsOrigin, ParachainsParasParaLifecycle, Phase, PolkadotPrimitivesV6DisputeStatement, PolkadotPrimitivesV6PvfPrepKind, PolkadotPrimitivesV6ValidDisputeStatementKind, PolkadotRuntimeParachainsCoretimeEvent, PreimageEvent, PreimageOldRequestStatus, PreimagePalletHoldReason, PreimageRequestStatus, PreimagesBounded, PvfExecKind, ReferendaTypesCurve, SlashingOffenceKind, StakingForcing, StakingPalletConfigOp, StakingPalletConfigOpBig, StakingRewardDestination, TokenError, TraitsScheduleDispatchTime, TransactionPaymentEvent, TransactionPaymentReleases, TransactionValidityTransactionSource, TransactionValidityUnknownTransaction, TransactionalError, TreasuryPaymentState, UpgradeGoAhead, UpgradeRestriction, ValidityAttestation, Version, VotingConviction, WestendRuntimeRuntimeFreezeReason, XcmPalletVersionMigrationStage, XcmV2JunctionBodyPart, XcmV2MultiassetWildFungibility, XcmV2OriginKind, XcmV3Instruction, XcmV3Junction, XcmV3JunctionBodyId, XcmV3JunctionNetworkId, XcmV3Junctions, XcmV3MaybeErrorCode, XcmV3MultiassetAssetId, XcmV3MultiassetAssetInstance, XcmV3MultiassetFungibility, XcmV3MultiassetMultiAssetFilter, XcmV3MultiassetWildMultiAsset, XcmV3Response, XcmV3TraitsError, XcmV3WeightLimit, XcmV4AssetAssetFilter, XcmV4AssetWildAsset, XcmV4Instruction, XcmV4Response, XcmV5AssetFilter, XcmV5Instruction, XcmV5Junction, XcmV5Junctions, XcmV5NetworkId, XcmV5WildAsset, XcmVersionedAssetId, XcmVersionedAssets, XcmVersionedLocation, XcmVersionedXcm, getMetadata, _allDescriptors as paseo };
