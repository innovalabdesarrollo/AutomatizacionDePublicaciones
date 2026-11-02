<script>
  import { onMount } from 'svelte';
  import { listRequests } from '$lib/api.js';
  import { statusBadge, stageLabel, formatDate } from '$lib/status.js';

  let items = $state([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      items = await listRequests();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="mb-6">
  <h1 class="font-display text-2xl font-bold sm:text-3xl">Publicaciones</h1>
  <p class="mt-1 text-sm text-slate-600">
    Seguimiento desde la investigación hasta el borrador en Shopify.
  </p>
</div>

{#if loading}
  <p class="text-sm text-slate-500">Cargando…</p>
{:else if error}
  <div class="card-panel border-red-200 text-danger">{error}</div>
{:else if items.length === 0}
  <div class="card-panel text-center">
    <p class="text-slate-600">Aún no hay solicitudes.</p>
    <a href="/nueva" class="btn-primary mt-4">Crear primera solicitud</a>
  </div>
{:else}
  <div class="space-y-3 sm:hidden">
    {#each items as item}
      <a href={`/solicitudes/${item.id}`} class="card-panel block active:scale-[0.99]">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-semibold">{item.productName || item.inputName || 'Sin nombre'}</p>
            <p class="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
          </div>
          <span class={`badge ${statusBadge(item.status)}`}>{item.status}</span>
        </div>
        <p class="mt-2 text-xs text-slate-600">Etapa: {stageLabel(item.stage)}</p>
      </a>
    {/each}
  </div>

  <div class="card-panel hidden overflow-x-auto p-0 sm:block">
    <table class="min-w-full text-left text-sm">
      <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th class="px-4 py-3">Producto</th>
          <th class="px-4 py-3">Fecha</th>
          <th class="px-4 py-3">Etapa</th>
          <th class="px-4 py-3">Estado</th>
          <th class="px-4 py-3">Shopify</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item}
          <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3">
              <a class="font-medium text-accentDark hover:underline" href={`/solicitudes/${item.id}`}>
                {item.productName || item.inputName || 'Sin nombre'}
              </a>
            </td>
            <td class="px-4 py-3 text-slate-600">{formatDate(item.createdAt)}</td>
            <td class="px-4 py-3">{stageLabel(item.stage)}</td>
            <td class="px-4 py-3">
              <span class={`badge ${statusBadge(item.status)}`}>{item.status}</span>
            </td>
            <td class="px-4 py-3 text-slate-600">{item.shopifyStatus || '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
