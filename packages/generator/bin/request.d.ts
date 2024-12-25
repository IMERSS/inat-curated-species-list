import { DownloadDataByPacket, GetDataPacketResponse, Taxon } from '../../types/internal';
export declare const resetData: () => void;
export declare const downloadDataByPacket: (args: DownloadDataByPacket) => void;
export declare const getDataPacket: (packetNum: number, placeId: number, taxonId: number, curators: string) => Promise<GetDataPacketResponse>;
export declare const extractSpecies: (rawData: GetDataPacketResponse, curators: string, taxonsToReturn: Taxon[]) => void;
//# sourceMappingURL=request.d.ts.map