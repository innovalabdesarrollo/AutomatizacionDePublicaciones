<script>
  import { goto } from '$app/navigation';
  import { createRequest, startResearch } from '$lib/api.js';

  let inputName = $state('');
  let inputBrand = $state('');
  let inputModel = $state('');
  let upc = $state('');
  let notes = $state('');
  let files = $state([]);
  let previews = $state([]);
  let loading = $state(false);
  let error = $state('');
  let statusMsg = $state('');

  function onFiles(e) {
    const list = Array.from(e.target.files || []);
    files = list;
    previews = list.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }

  function removePreview(index) {
    previews = previews.filter((_, i) => i !== index);
    files = files.filter((_, i) => i !== index);
  }

  async function submit(andResearch) {
    error = '';
    if (!inputName && !upc && files.length === 0) {
      error = 'Captura nombre, UPC o al menos una imagen.';
      return;
    }
    if (upc && !/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(upc.trim())) {
      error = 'UPC inválido (8, 12, 13 o 14 dígitos).';
      return;
    }

    loading = true;
    try {
      const fd = new FormData();
      if (inputName) fd.append('inputName', inputName);
      if (inputBrand) fd.append('inputBrand', inputBrand);
      if (inputModel) fd.append('inputModel', inputModel);
      if (upc) fd.append('upc', upc);
      if (notes) fd.append('notes', notes);
      for (const f of files) fd.append('images', f);

      statusMsg = 'Guardando solicitud…';
      const created = await createRequest(fd);

      if (andResearch) {
        statusMsg = 'Investigando con IA…';
        await startResearch(created.id);
      }
      goto(`/solicitudes/${created.id}`);
    } catch (e) {
      error = e.message;
      statusMsg = '';
    } finally {
      loading = false;
    }
  }
</script>

<div class="mb-6">
  <h1 class="font-display text-2xl font-bold">Nueva solicitud</h1>
  <p class="mt-1 text-sm text-slate-600">Captura lo que tengas. Ningún campo es obligatorio por sí solo.</p>
</div>

<form class="card-panel space-y-4" onsubmit={(e) => e.preventDefault()}>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="sm:col-span-2">
      <label class="label" for="name">Nombre del producto</label>
      <input id="name" class="field" bind:value={inputName} />
    </div>
    <div>
      <label class="label" for="brand">Marca</label>
      <input id="brand" class="field" bind:value={inputBrand} />
    </div>
    <div>
      <label class="label" for="model">Modelo</label>
      <input id="model" class="field" bind:value={inputModel} />
    </div>
    <div>
      <label class="label" for="upc">UPC</label>
      <input id="upc" class="field" bind:value={upc} inputmode="numeric" />
    </div>
    <div>
      <label class="label" for="notes">Notas</label>
      <input id="notes" class="field" bind:value={notes} />
    </div>
  </div>

  <div>
    <label class="label" for="images">Imágenes</label>
    <input
      id="images"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      class="field file:mr-3 file:rounded-md file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-accentDark"
      onchange={onFiles}
    />
    {#if previews.length}
      <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {#each previews as p, i}
          <div class="relative overflow-hidden rounded-xl border border-slate-200">
            <img src={p.url} alt={p.name} class="aspect-square w-full object-cover" />
            <button
              type="button"
              class="absolute right-1 top-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white"
              onclick={() => removePreview(i)}
            >
              Quitar
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if error}
    <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
  {/if}
  {#if statusMsg}
    <p class="rounded-lg bg-teal-50 px-3 py-2 text-sm text-accentDark">{statusMsg}</p>
  {/if}

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
    <button type="button" class="btn-secondary" disabled={loading} onclick={() => submit(false)}>
      Guardar y continuar
    </button>
    <button type="button" class="btn-primary" disabled={loading} onclick={() => submit(true)}>
      {loading ? 'Procesando…' : 'Guardar e investigar'}
    </button>
  </div>
</form>
