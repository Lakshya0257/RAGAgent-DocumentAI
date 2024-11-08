import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '../../src', 'proto', 'rag.proto');


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const ragProto = grpc.loadPackageDefinition(packageDefinition) as any;
export const client = new ragProto.rag.RAGService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);
