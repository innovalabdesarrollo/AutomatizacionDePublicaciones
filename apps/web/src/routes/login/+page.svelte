<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { login } from '$lib/api.js';
  import { user } from '$lib/auth.js';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit(e) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const data = await login({ email, password });
      user.set(data.user);
      const next = $page.url.searchParams.get('next') || '/';
      goto(next.startsWith('/') ? next : '/');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e2e8f0_0%,_#f8fafc_70%)] px-4">
  <form class="card-panel w-full max-w-md space-y-4" onsubmit={submit}>
    <div>
      <h1 class="font-display text-2xl font-bold">Iniciar sesión</h1>
      <p class="mt-1 text-sm text-slate-600">TechnStore Publicaciones</p>
    </div>
    <div>
      <label class="label" for="email">Correo</label>
      <input id="email" class="field" type="email" autocomplete="email" required bind:value={email} />
    </div>
    <div>
      <label class="label" for="password">Contraseña</label>
      <input
        id="password"
        class="field"
        type="password"
        autocomplete="current-password"
        required
        bind:value={password}
      />
    </div>
    {#if error}
      <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
    {/if}
    <button class="btn-primary w-full" disabled={loading}>
      {loading ? 'Entrando…' : 'Entrar'}
    </button>
    <p class="text-center text-sm text-slate-600">
      ¿Sin cuenta?
      <a class="font-semibold text-accentDark hover:underline" href="/registro">Regístrate</a>
    </p>
  </form>
</div>
