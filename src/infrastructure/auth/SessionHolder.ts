export class SessionHolder {
  private token: string | null = null;

  set(token: string | null): void {
    this.token = token;
  }

  get(): string | null {
    return this.token;
  }
}
