interface Options {
  hostname: string;
  service: string;
  ddtags: string;
}

export class DatadogLogger {
  constructor(private apiKey: string) {}

  async log(options: Options, messages: any[]) {
    const url = `https://http-intake.logs.datadoghq.com/api/v2/logs`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": this.apiKey,
      },
      body: JSON.stringify(
        messages.map((message) => ({
          message,
          ...options,
        })),
      ),
    });
  }
}
