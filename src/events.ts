export type Event = {
  aggregation_key?: string;
  alert_type?: EventAlertType;
  date_happened?: number;
  device_name?: string;
  host?: string;
  priority?: EventPriority;
  related_event_id?: number;
  tags?: string[];
  text: string;
  title: string;
};

export type EventAlertType =
  | "error"
  | "warning"
  | "info"
  | "success"
  | "user_update"
  | "recommendation"
  | "snapshot";

export type EventPriority = "normal" | "low";

// https://docs.datadoghq.com/api/latest/events/#post-an-event
export async function sendEvent(apiKey: string, event: Event) {
  const response = await fetch("https://api.datadoghq.com/api/v1/events", {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "dd-api-key": apiKey,
    },
    body: JSON.stringify(event),
  });
}
