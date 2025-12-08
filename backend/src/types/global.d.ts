/// <reference types="multer" />

// Extend Express namespace to include Multer types globally
declare global {
    namespace Express {
        namespace Multer {
            interface File {
                fieldname: string;
                originalname: string;
                encoding: string;
                mimetype: string;
                size: number;
                destination: string;
                filename: string;
                path: string;
                buffer: Buffer;
                stream: NodeJS.ReadableStream;
            }
        }
    }
}

export { };
