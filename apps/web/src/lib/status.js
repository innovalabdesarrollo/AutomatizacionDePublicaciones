export function statusBadge(status) {
  const map = {
    pendiente: 'bg-slate-100 text-slate-700',
    procesando: 'bg-amber-100 text-amber-800',
    completada: 'bg-emerald-100 text-emerald-800',
    fallida: 'bg-red-100 text-red-800',
    borrador: 'bg-sky-100 text-sky-800',
    generada: 'bg-violet-100 text-violet-800',
    en_revision: 'bg-amber-100 text-amber-800',
    enviada_shopify: 'bg-emerald-100 text-emerald-800',
    confirmado: 'bg-emerald-100 text-emerald-800',
    parcial: 'bg-amber-100 text-amber-800',
    no_confirmado: 'bg-red-100 text-red-800',
    admin: 'bg-teal-100 text-teal-800',
    user: 'bg-slate-100 text-slate-700'
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export function stageLabel(stage) {
  const map = {
    captura: 'Captura',
    investigacion: 'Investigación',
    resultado: 'Resultado',
    datos_internos: 'Datos internos',
    envio_shopify: 'Envío Shopify',
    enviado_shopify: 'Enviado a Shopify'
  };
  return map[stage] || stage || '—';
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Mexico_City'
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}
