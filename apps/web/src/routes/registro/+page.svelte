<script>
  import { goto } from '$app/navigation';
  import { register } from '$lib/api.js';
  import { user } from '$lib/auth.js';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit(e) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const data = await register({ name, email, password });
      user.set(data.user);
      goto('/');
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
      <h1 class="font-display text-2xl font-bold">Crear cuenta</h1>
      <p class="mt-1 text-sm text-slate-600">TechnStore Publicaciones</p>
    </div>
    <div>
      <label class="label" for="name">Nombre</label>
      <input id="name" class="field" required minlength="2" autocomplete="name" bind:value={name} />
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
        autocomplete="new-password"
        required
        minlength="8"
        bind:value={password}
      />
      <p class="mt-1 text-xs text-slate-500">Mín. 8 caracteres, con letras y números.</p>
    </div>
    {#if error}
      <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
    {/if}
    <button class="btn-primary w-full" disabled={loading}>
      {loading ? 'Creando…' : 'Registrarme'}
    </button>
    <p class="text-center text-sm text-slate-600">
      ¿Ya tienes cuenta?
      <a class="font-semibold text-accentDark hover:underline" href="/login">Inicia sesión</a>
    </p>
  </form>
</div>
