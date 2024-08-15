import { StructuredError } from "../errorUtils";

import { AgentPayloadSchema } from "./gen/agent_payload_pb";
import { create, toBinary } from "@bufbuild/protobuf";

export type TracerOptions = {
  env: string;
  service: string;
  hostname: string;
  version: string;
  apiKey: string;
};

export type SpanOptions = {
  name?: string;
  resource?: string;
  service?: string;
  meta?: Record<string, string | undefined>;
  metrics?: Record<string, number>;
  isTopLevel?: boolean;
};

export type RecordedSpan = {
  opts: SpanOptions;
  startMs: number;
  durationMs: number;
  spanId: bigint;
  traceId: bigint;
  parentSpanId?: bigint;
};

async function sendSpans(apiKey: string, opts: TracerOptions, spans: RecordedSpan[]) {
  const payload = create(AgentPayloadSchema, {
    hostName: opts.hostname,
    env: opts.env,
    tracerPayloads: [
      {
        appVersion: opts.version,
        chunks: [
          {
            priority: -128,
            spans: spans.map((span) => ({
              name: span.opts.name,
              service: span.opts.service ?? opts.service,
              resource: span.opts.resource,
              meta: Object.fromEntries(
                  Object.entries(span.opts.meta ?? {}).flatMap(
                      ([key, value]) => {
                        if (value === undefined) {
                          return [];
                        }

                        return [[key, value]];
                      },
                  ),
              ),
              metrics: span.opts.metrics ?? {},
              spanID: span.spanId,
              traceID: span.traceId,
              start: millisToNanos(span.startMs),
              duration: millisToNanos(span.durationMs),
              parentID: span.parentSpanId,
            })),
          },
        ],
      },
    ],
  });

  // todo: gzip

  const response = await fetch(
      "https://trace.agent.datadoghq.com/api/v0.2/traces",
      {
        method: "POST",
        headers: {
          "content-type": "application/x-protobuf",
          "X-Datadog-Reported-Languages": "",
          "dd-api-key": apiKey,
        },
        body: toBinary(AgentPayloadSchema, payload),
      },
  );

  if (!response.ok) {
    throw new StructuredError({
      status: response.status,
      statusText: response.statusText,
    });
  }
}

function millisToNanos(value: number) {
  return BigInt(value) * 1000000n;
}

