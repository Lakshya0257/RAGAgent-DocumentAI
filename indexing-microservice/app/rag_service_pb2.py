# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: rag_service.proto
# Protobuf Python Version: 5.27.2
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    27,
    2,
    '',
    'rag_service.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x11rag_service.proto\x12\x03rag\"E\n\x0f\x44ocumentRequest\x12\x0f\n\x07\x66ile_id\x18\x01 \x01(\t\x12\x0f\n\x07user_id\x18\x02 \x01(\t\x12\x10\n\x08\x66ile_url\x18\x03 \x01(\t\"3\n\x10\x44ocumentResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\x12\x0f\n\x07message\x18\x02 \x01(\t\" \n\rDeleteRequest\x12\x0f\n\x07\x66ile_id\x18\x01 \x01(\t2\x8b\x01\n\nRAGService\x12@\n\x0fProcessDocument\x12\x14.rag.DocumentRequest\x1a\x15.rag.DocumentResponse\"\x00\x12;\n\x0e\x44\x65leteDocument\x12\x12.rag.DeleteRequest\x1a\x15.rag.DocumentResponseb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'rag_service_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_DOCUMENTREQUEST']._serialized_start=26
  _globals['_DOCUMENTREQUEST']._serialized_end=95
  _globals['_DOCUMENTRESPONSE']._serialized_start=97
  _globals['_DOCUMENTRESPONSE']._serialized_end=148
  _globals['_DELETEREQUEST']._serialized_start=150
  _globals['_DELETEREQUEST']._serialized_end=182
  _globals['_RAGSERVICE']._serialized_start=185
  _globals['_RAGSERVICE']._serialized_end=324
# @@protoc_insertion_point(module_scope)