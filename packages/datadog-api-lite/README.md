# datadog-api-lite

A simple datadog api wrapper for submitting traces, logs and events without
datadog agent.

## why?

some possible reasons

* you want to submit traces, logs and events from somewhere the datadog agent
  isn't available (deno deploy, cloudflare workers)

* you'd like to use usage based billing instead of host based billing.

## billing

submitting data to these endpoints directly results in usage based billing (also
known as serverless billing). traces are $15/million traces billed on demand and
logs are $0.10/GB/month ingest + $2.55/million logs indexed/month. Events seem
to be free or included log billing.

details are here on [datadog's billing page][billing].

[billing]: https://www.datadoghq.com/pricing/