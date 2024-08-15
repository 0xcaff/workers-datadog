import { Span, Tracer } from "./types";
import { RecordedSpan, SpanOptions, TracerOptions } from "datadog-api-lite";

export class DatadogTracer implements Tracer {
  private readonly opts: TracerOptions;
  private readonly spans: RecordedSpan[] = [];

  constructor(opts: TracerOptions) {
    this.opts = opts;
  }

  addSpan(recordedSpan: RecordedSpan) {
    this.spans.push(recordedSpan);
  }

  public startSpan(
    opts: SpanOptions,
    traceId = generateId(),
    parentSpanId?: bigint,
  ): DatadogSpan {
    return new DatadogSpan(this, opts, traceId, parentSpanId);
  }

  public async flushSpans(): Promise<void> {
    this.spans.splice(0, this.spans.length);
  }
}

class DatadogSpan implements Span {
  private readonly tracer: DatadogTracer;
  private readonly startTimeMs: number;
  private readonly traceId: bigint;
  private readonly parentSpanId?: bigint;
  private readonly initialOptions: SpanOptions;
  private readonly spanId = generateId();

  constructor(
    tracer: DatadogTracer,
    opts: SpanOptions,
    traceId: bigint,
    parentSpanId?: bigint,
  ) {
    this.tracer = tracer;
    this.startTimeMs = Date.now();
    this.traceId = traceId;
    this.parentSpanId = parentSpanId;
    this.initialOptions = opts;
  }

  finishSpan(opts?: SpanOptions) {
    const endMs = Date.now();
    const startMs = this.startTimeMs;
    const durationMs = endMs - startMs;

    if (durationMs < 5) {
      return;
    }

    const isTopLevelSpan = this.initialOptions.isTopLevel ?? opts?.isTopLevel;

    this.tracer.addSpan({
      opts: {
        ...this.initialOptions,
        ...opts,

        meta: {
          ...this.initialOptions.meta,
          ...opts?.meta,
        },

        metrics: {
          ...(() => {
            if (isTopLevelSpan) {
              return {
                _top_level: 1,
              };
            }
          })(),
          ...this.initialOptions.metrics,
          ...opts?.metrics,
        },
      },
      startMs,
      durationMs,
      spanId: this.spanId,
      traceId: this.traceId,
      parentSpanId: this.parentSpanId,
    });
  }

  startSpan(opts: SpanOptions): DatadogSpan {
    return new DatadogSpan(this.tracer, opts, this.traceId, this.spanId);
  }

  contextHeaders(): Record<string, string> {
    return {
      [datadogParentIdHeaderKey]: this.spanId.toString(),
      [datadogTraceIdHeaderKey]: this.traceId.toString(),
    };
  }
}

export const datadogParentIdHeaderKey = "x-datadog-parent-id";
export const datadogTraceIdHeaderKey = "x-datadog-trace-id";

function generateId() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  const bytesHex = bytes.reduce(
    (acc, byte) => acc + byte.toString(16).padStart(2, "0"),
    "",
  );
  return BigInt(`0x${bytesHex}`);
}
