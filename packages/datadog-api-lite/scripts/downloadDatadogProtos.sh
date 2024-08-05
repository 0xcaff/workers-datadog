#!/bin/bash

curl --remote-name-all --create-dirs --output-dir src/traces/proto https://raw.githubusercontent.com/DataDog/datadog-agent/f654422c4328d69fe40f726cc3e7d039df5d6ef3/pkg/trace/pb/{agent_payload,span,tracer_payload,stats}.proto
curl --remote-name-all --create-dirs --output-dir src/traces/proto/github.com/gogo/protobuf/gogoproto/ https://raw.githubusercontent.com/gogo/protobuf/f67b8970b736e53dbd7d0a27146c8f1ac52f74e5/gogoproto/gogo.proto
