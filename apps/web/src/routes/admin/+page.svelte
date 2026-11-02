<script>
  import { onMount } from 'svelte';
  import {
    adminListRoles,
    adminCreateRole,
    adminDeleteRole,
    adminListUsers,
    adminUpdateUser
  } from '$lib/api.js';
  import { statusBadge, formatDate } from '$lib/status.js';

  let roles = $state([]);
  let users = $state([]);
  let loading = $state(true);
  let error = $state('');
  let message = $state('');

  let newName = $state('');
  let newSlug = $state('');
  let newDesc = $state('');
  let busy = $state(false);

  async function refresh() {
    const [r, u] = await Promise.all([adminListRoles(), adminListUsers()]);
    roles = r;
    users = u;
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

  async function createRole(e) {
    e.preventDefault();
    error = '';
    message = '';
    busy = true;
    try {
      await adminCreateRole({
        name: newName,
        slug: newSlug || undefined,
        description: newDesc
      });
      newName = '';
      newSlug = '';
      newDesc = '';
      message = 'Rol creado.';
      await refresh();
    } catch (err) {
      error = err.message;
    } finally {
      busy = false;
    }
  }

  async function removeRole(id) {
    if (!confirm('¿Eliminar este rol?')) return;
    busy = true;
    error = '';
    try {
      await adminDeleteRole(id);
      message = 'Rol eliminado.';
      await refresh();
    } catch (err) {
      error = err.message;
    } finally {
      busy = false;
    }
  }

  async function changeUserRole(userId, role) {
    busy = true;
    error = '';
    try {
      await adminUpdateUser(userId, { role });
      message = 'Rol de usuario actualizado.';
      await refresh();
    } catch (err) {
      error = err.message;
    } finally {
      busy = false;
    }
  }

  async function toggleActive(u) {
    busy = true;
    error = '';
    try {
      await adminUpdateUser(u.id, { active: !u.active });
      message = u.active ? 'Usuario desactivado.' : 'Usuario activado.';
      await refresh();
    } catch (err) {
      error = err.message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="mb-6">
  <h1 class="font-display text-2xl font-bold">Administración</h1>
  <p class="mt-1 text-sm text-slate-600">Roles del sistema y usuarios. Por ahora: admin y user.</p>
</div>

{#if loading}
  <p class="text-sm text-slate-500">Cargando…</p>
{:else}
  {#if error}
    <p class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>
  {/if}
  {#if message}
    <p class="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
  {/if}

  <div class="space-y-4">
    <section class="card-panel">
      <h2 class="font-display text-lg font-semibold">Roles</h2>
      <ul class="mt-3 space-y-2">
        {#each roles as role}
          <li class="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium">
                {role.name}
                <span class={`badge ml-2 ${statusBadge(role.slug)}`}>{role.slug}</span>
                {#if role.system}
                  <span class="badge ml-1 bg-slate-100 text-slate-600">sistema</span>
                {/if}
              </p>
              <p class="text-xs text-slate-500">{role.description || '—'}</p>
            </div>
            {#if !role.system}
              <button class="btn-danger text-xs" disabled={busy} onclick={() => removeRole(role.id)}>
                Eliminar
              </button>
            {/if}
          </li>
        {/each}
      </ul>

      <form class="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2" onsubmit={createRole}>
        <div>
          <label class="label" for="rn">Nombre del rol</label>
          <input id="rn" class="field" required bind:value={newName} placeholder="Ej. revisor" />
        </div>
        <div>
          <label class="label" for="rs">Slug (opcional)</label>
          <input id="rs" class="field" bind:value={newSlug} placeholder="revisor" />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="rd">Descripción</label>
          <input id="rd" class="field" bind:value={newDesc} />
        </div>
        <div class="sm:col-span-2">
          <button class="btn-primary" disabled={busy}>Crear rol</button>
        </div>
      </form>
    </section>

    <section class="card-panel">
      <h2 class="font-display text-lg font-semibold">Usuarios</h2>
      <div class="mt-3 space-y-3">
        {#each users as u}
          <div class="rounded-xl border border-slate-100 p-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="font-medium">{u.name}</p>
                <p class="text-xs text-slate-500">{u.email} · {formatDate(u.createdAt)}</p>
              </div>
              <span class={`badge ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {u.active ? 'activo' : 'inactivo'}
              </span>
            </div>
            <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label class="text-xs font-medium text-slate-600" for={`role-${u.id}`}>Rol</label>
              <select
                id={`role-${u.id}`}
                class="field sm:max-w-xs"
                value={u.role}
                disabled={busy}
                onchange={(e) => changeUserRole(u.id, e.currentTarget.value)}
              >
                {#each roles as role}
                  <option value={role.slug}>{role.name} ({role.slug})</option>
                {/each}
              </select>
              <button class="btn-secondary text-xs" disabled={busy} onclick={() => toggleActive(u)}>
                {u.active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{/if}
