import multer from "multer";
export declare const uploadLocal: multer.Multer;
export declare const uploadCloudinary: multer.Multer;
export declare const uploadSingleFile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMultipleFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadFields: (fields: {
    name: string;
    maxCount: number;
}[]) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadToCloudinary: (filePath: string, folder?: string) => Promise<{
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
}>;
export declare const uploadMultipleToCloudinary: (filePaths: string[], folder?: string) => Promise<{
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
}[]>;
export declare const deleteLocalFile: (filePath: string) => void;
export declare const deleteFromCloudinary: (publicId: string) => Promise<any>;
export declare const deleteMultipleFromCloudinary: (publicIds: string[]) => Promise<any>;
export declare const getFileInfo: (publicId: string) => Promise<any>;
export declare const createEntityImageUpload: (entityType: string) => (req: any, res: any, next: any) => Promise<void>;
export declare const processUploadedFiles: (files: Express.Multer.File[], entityId: string, entityType: "hotel" | "flight" | "trip" | "user", prisma: any) => Promise<any[]>;
//# sourceMappingURL=fileUpload.d.ts.map