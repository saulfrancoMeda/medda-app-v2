/**
 * Guarda el JWT de la sesión actual para que el HttpClient lo use como Authorization en
 * llamadas autenticadas ('user'). Lo actualiza el AuthProvider al iniciar/cerrar sesión.
 * (El legacy lo toma de Auth.currentSession().accessToken.jwtToken.)
 */
export class SessionHolder {
  private token: string | null = null;

  set(token: string | null): void {
    this.token = token;
  }

  get(): string | null {
    return this.token;
  }
}
