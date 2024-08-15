import { SpanOptions } from "datadog-api-lite";

export interface Tracer {
  startSpan(opts: SpanOptions, traceId?: bigint, parentSpanId?: bigint): Span;
  flushSpans(): Promise<void>;
}

export interface Span extends ReadOnlySpan {
  finishSpan(opts?: SpanOptions): void;
}

export interface ReadOnlySpan {
  startSpan(opts: SpanOptions): Span;
  contextHeaders(): Record<string, string>;
}
