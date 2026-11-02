<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user, authReady, loadSession, signOut } from '$lib/auth.js';
  import { apiUrl } from '$lib/config.js';

  let { children } = $props();
  let openaiDemo = $state(false);

  const publicPaths = ['/login', '/registro'];

  onMount(() => {
    loadSession();
    fetch(apiUrl('/api/health'), { credentials: 'include' })
      .then((r) => r.json())
      .then((h) => {
        openaiDemo = Boolean(h.openaiDemo);
      })
      .catch(() => {});
  });


  $effect(() => {
    if (!$authReady) return;
    const path = $page.url.pathname;
    const isPublic = publicPaths.includes(path);

    if (!$user && !isPublic) {
      goto(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    if ($user && isPublic) {
      goto('/');
      return;
    }
    if ($user && path.startsWith('/admin') && $user.role !== 'admin') {
      goto('/');
    }
  });

  async function handleLogout() {
    await signOut();
    goto('/login');
  }
</script>

{#if !$authReady}
  <div class="grid min-h-screen place-items-center text-sm text-slate-500">Cargando…</div>
{:else if publicPaths.includes($page.url.pathname)}
  {@render children()}
{:else if $user}
  <div class="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e2e8f0_0%,_#f1f5f9_45%,_#f8fafc_100%)]">
    <header class="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="/" class="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
          TechnStore <span class="text-accent">Publicaciones</span>
        </a>
        <div class="flex flex-wrap items-center gap-2">
          {#if $user.role === 'admin'}
            <a href="/admin" class="btn-secondary text-xs sm:text-sm">Administración</a>
          {/if}
          <a href="/nueva" class="btn-primary text-xs sm:text-sm">Nueva solicitud</a>
          <span class="hidden text-xs text-slate-500 sm:inline">{$user.name} · {$user.role}</span>
          <button type="button" class="btn-secondary text-xs sm:text-sm" onclick={handleLogout}>
            Salir
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {#if openaiDemo}
        <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Modo demo IA.</strong> Sin <code class="text-xs">OPENAI_API_KEY</code> la
          investigación genera datos de ejemplo para mostrar el flujo. Al pegar la key del cliente
          en <code class="text-xs">apps/api/.env</code> pasa a OpenAI real.
        </div>
      {/if}
      {@render children()}
    </main>
  </div>
{/if}

