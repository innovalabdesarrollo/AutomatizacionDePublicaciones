<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import {
    getRequest,
    updateRequest,
    startResearch,
    updateSheet,
    saveInternal,
    sendShopify,
    retry,
    deleteImage
  } from '$lib/api.js';
  import { statusBadge, stageLabel, formatDate } from '$lib/status.js';
  import { apiUrl } from '$lib/config.js';

  let id = $derived($page.params.id);
  let data = $state(null);
  let loading = $state(true);
  let busy = $state('');
  let error = $state('');
  let message = $state('');

  let editName = $state('');
  let editBrand = $state('');
  let editModel = $state('');
  let editUpc = $state('');
  let editNotes = $state('');
  let sheetTitle = $state('');
  let sheetDesc = $state('');
  let sheetBrand = $state('');
  let sheetModel = $state('');
  let sheetUpc = $state('');
  let sku = $state('');
  let stock = $state('');
  let completedBy = $state('operador');

  async function refresh() {
    data = await getRequest(id);
    const r = data.request;
    editName = r.inputName || '';
    editBrand = r.inputBrand || '';
    editModel = r.inputModel || '';
    editUpc = r.upc || '';
    editNotes = r.notes || '';
    if (data.sheet) {
      sheetTitle = data.sheet.title || '';
      sheetDesc = data.sheet.description || '';
      sheetBrand = data.sheet.brand || '';
      sheetModel = data.sheet.model || '';
      sheetUpc = data.sheet.upc || '';
    }
    if (data.internal) {
      sku = data.internal.sku || '';
      stock = String(data.internal.stockQuantity ?? '');
      completedBy = data.internal.completedBy || 'operador';
    }
  }

  onMount(async () => {
    try {
      await refresh();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  async function run(label, fn) {
    error = '';
    message = '';
    busy = label;
    try {
      await fn();
      await refresh();
    } catch (e) {
      error = e.message;
    } finally {
      busy = '';
    }
  }
</script>

{#if loading}
  <p class="text-sm text-slate-500">Cargando…</p>
{:else if !data}
  <div class="card-panel text-danger">{error || 'No encontrada'}</div>
{:else}
  {@const r = data.request}
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <a href="/" class="text-xs font-medium text-accentDark hover:underline">← Listado</a>
      <h1 class="mt-1 font-display text-2xl font-bold">
        {data.product?.name || r.inputName || 'Solicitud'}
      </h1>
      <p class="mt-1 text-sm text-slate-600">
        {formatDate(r.createdAt)} · {stageLabel(r.stage)}
      </p>
    </div>
    <span class={`badge ${statusBadge(r.status)}`}>{r.status}</span>
  </div>

  {#if error}
    <div class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
      <p>{error}</p>
      {#if r.status === 'fallida'}
        <div class="mt-2 flex flex-wrap gap-2">
          <button class="btn-secondary" disabled={!!busy} onclick={() => run('retry', () => retry(id, 'research'))}>
            Reintentar investigación
          </button>
          <button class="btn-secondary" disabled={!!busy} onclick={() => run('retry', () => retry(id, 'shopify'))}>
            Reintentar Shopify
          </button>
        </div>
      {/if}
    </div>
  {/if}
  {#if message}
    <p class="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
  {/if}

  <div class="space-y-4">
    <section class="card-panel">
      <h2 class="font-display text-lg font-semibold">1. Datos de entrada</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="label" for="en">Nombre</label>
          <input id="en" class="field" bind:value={editName} />
        </div>
        <div>
          <label class="label" for="eb">Marca</label>
          <input id="eb" class="field" bind:value={editBrand} />
        </div>
        <div>
          <label class="label" for="em">Modelo</label>
          <input id="em" class="field" bind:value={editModel} />
        </div>
        <div>
          <label class="label" for="eu">UPC</label>
          <input id="eu" class="field" bind:value={editUpc} />
        </div>
        <div>
          <label class="label" for="eno">Notas</label>
          <input id="eno" class="field" bind:value={editNotes} />
        </div>
      </div>
      {#if data.images?.length}
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {#each data.images as img}
            <div class="relative overflow-hidden rounded-xl border">
              <img src={apiUrl(img.imageUrl)} alt="Producto" class="aspect-square w-full object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white"
                disabled={!!busy}
                onclick={() => run('img', () => deleteImage(id, img.id))}
              >
                Quitar
              </button>
            </div>
          {/each}
        </div>
      {/if}
      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          class="btn-secondary"
          disabled={!!busy}
          onclick={() =>
            run('inputs', async () => {
              await updateRequest(id, {
                inputName: editName,
                inputBrand: editBrand,
                inputModel: editModel,
                upc: editUpc,
                notes: editNotes
              });
              message = 'Datos actualizados.';
            })}
        >
          Guardar cambios
        </button>
        <button
          class="btn-primary"
          disabled={!!busy}
          onclick={() =>
            run('research', async () => {
              await startResearch(id);
              message = 'Investigación finalizada.';
            })}
        >
          {busy === 'research' ? 'Investigando…' : 'Iniciar / repetir investigación'}
        </button>
      </div>
    </section>

    {#if data.result}
      <section class="card-panel">
        <h2 class="font-display text-lg font-semibold">2. Identificación</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <span class={`badge ${statusBadge(data.result.validationStatus)}`}>
            {data.result.validationStatus}
          </span>
          {#if data.result.demo}
            <span class="badge bg-amber-100 text-amber-900">DEMO · sin OpenAI</span>
          {/if}
        </div>

        <p class="mt-2 font-medium">{data.result.identifiedName}</p>
        <p class="text-sm text-slate-600">
          {[data.result.identifiedBrand, data.result.identifiedModel].filter(Boolean).join(' · ') || '—'}
        </p>
        {#if data.result.findings}
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{data.result.findings}</p>
        {/if}
        {#if data.result.discrepancies?.length}
          <ul class="mt-3 list-disc rounded-lg bg-amber-50 px-5 py-2 text-sm text-warn">
            {#each data.result.discrepancies as d}<li>{d}</li>{/each}
          </ul>
        {/if}
        {#if data.result.sources?.length}
          <div class="mt-3 text-sm">
            <p class="font-medium text-slate-700">Fuentes</p>
            <ul class="mt-1 list-disc pl-5 text-slate-600">
              {#each data.result.sources as s}<li>{s}</li>{/each}
            </ul>
          </div>
        {/if}
      </section>
    {/if}

    {#if data.sheet}
      <section class="card-panel">
        <h2 class="font-display text-lg font-semibold">3. Ficha</h2>
        <div class="mt-3 grid gap-3">
          <div>
            <label class="label" for="st">Título</label>
            <input id="st" class="field" bind:value={sheetTitle} />
          </div>
          <div>
            <label class="label" for="sd">Descripción</label>
            <textarea id="sd" class="field min-h-28" bind:value={sheetDesc}></textarea>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <label class="label" for="sb">Marca</label>
              <input id="sb" class="field" bind:value={sheetBrand} />
            </div>
            <div>
              <label class="label" for="sm">Modelo</label>
              <input id="sm" class="field" bind:value={sheetModel} />
            </div>
            <div>
              <label class="label" for="su">UPC</label>
              <input id="su" class="field" bind:value={sheetUpc} />
            </div>
          </div>
          {#if data.sheet.specs?.length}
            <table class="min-w-full text-sm">
              <tbody>
                {#each data.sheet.specs as spec}
                  <tr class="border-b border-slate-100">
                    <td class="py-1.5 pr-3 font-medium">{spec.name}</td>
                    <td class="py-1.5">{spec.value}</td>
                    <td class="py-1.5">
                      {#if spec.confirmed === false}
                        <span class="badge bg-amber-100 text-warn">no confirmado</span>
                      {:else}
                        <span class="badge bg-emerald-100 text-emerald-800">ok</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
        <button
          class="btn-secondary mt-4"
          disabled={!!busy}
          onclick={() =>
            run('sheet', async () => {
              await updateSheet(id, {
                title: sheetTitle,
                description: sheetDesc,
                brand: sheetBrand,
                model: sheetModel,
                upc: sheetUpc,
                features: data.sheet?.features || [],
                specs: data.sheet?.specs || []
              });
              message = 'Ficha guardada.';
            })}
        >
          Guardar ficha
        </button>
      </section>

      <section class="card-panel">
        <h2 class="font-display text-lg font-semibold">4. Datos internos</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label class="label" for="sku">SKU *</label>
            <input id="sku" class="field" bind:value={sku} />
          </div>
          <div>
            <label class="label" for="stock">Stock *</label>
            <input id="stock" class="field" type="number" min="0" step="1" bind:value={stock} />
          </div>
          <div>
            <label class="label" for="who">Completado por</label>
            <input id="who" class="field" bind:value={completedBy} />
          </div>
        </div>
        <button
          class="btn-secondary mt-4"
          disabled={!!busy}
          onclick={() =>
            run('internal', async () => {
              await saveInternal(id, { sku, stockQuantity: stock, completedBy });
              message = 'Datos internos guardados.';
            })}
        >
          Guardar SKU y stock
        </button>
      </section>

      <section class="card-panel">
        <h2 class="font-display text-lg font-semibold">5. Shopify (borrador)</h2>
        {#if data.shopify?.shopifyAdminUrl}
          <a
            class="mt-2 inline-block text-sm font-semibold text-accentDark hover:underline"
            href={data.shopify.shopifyAdminUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir en Shopify →
          </a>
        {/if}
        {#if data.shopify?.lastErrorMessage}
          <p class="mt-2 text-sm text-danger">{data.shopify.lastErrorMessage}</p>
        {/if}
        <button
          class="btn-primary mt-4"
          disabled={!!busy || data.shopify?.status === 'borrador'}
          onclick={() => {
            if (!confirm('¿Enviar a Shopify como BORRADOR?')) return;
            run('shopify', async () => {
              const res = await sendShopify(id);
              message = res.alreadySent ? res.message : 'Borrador creado en Shopify.';
              if (res.bundle) data = res.bundle;
            });
          }}
        >
          {busy === 'shopify' ? 'Enviando…' : 'Confirmar envío como borrador'}
        </button>
      </section>
    {/if}
  </div>
{/if}
