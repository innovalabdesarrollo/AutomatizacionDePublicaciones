import fs from 'fs';

export function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** Demo local/Vercel sin key: el cliente ve el flujo completo con datos de ejemplo. */
export function isDemoAi() {
  return !isOpenAiConfigured();
}

function requireOpenAiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'Falta OPENAI_API_KEY en apps/api/.env (credencial del cliente).'
    );
  }
  return key;
}

async function callOpenAi(messages, useJson = true) {
  const key = requireOpenAiKey();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const body = { model, messages, temperature: 0.2 };
  if (useJson) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

function toDataUrl(input, mimeType) {
  if (Buffer.isBuffer(input)) {
    return `data:${mimeType};base64,${input.toString('base64')}`;
  }
  if (typeof input === 'string' && input.startsWith('data:')) return input;
  if (typeof input === 'string' && fs.existsSync(input)) {
    const buf = fs.readFileSync(input);
    return `data:${mimeType};base64,${buf.toString('base64')}`;
  }
  if (typeof input === 'string') {
    return `data:${mimeType};base64,${input}`;
  }
  throw new Error('Imagen inválida para análisis');
}

function demoExtractFromImage() {
  return {
    extractedText: '[DEMO] Texto de ejemplo en empaque: marca / modelo visibles',
    brand: null,
    model: null,
    productHints: 'Imagen de producto retail (resultado simulado sin OpenAI)'
  };
}

function demoResearchProduct({ input, imageFindings }) {
  const name =
    input?.name?.trim() ||
    [input?.brand, input?.model].filter(Boolean).join(' ') ||
    (input?.upc ? `Producto UPC ${input.upc}` : 'Producto de demostración');
  const brand = input?.brand?.trim() || 'MarcaDemo';
  const model = input?.model?.trim() || 'MD-100';
  const upc = input?.upc?.trim() || null;
  const title = `${brand} ${model} — ${name}`.slice(0, 120);

  return {
    identifiedName: name,
    identifiedBrand: brand,
    identifiedModel: model,
    confidenceScore: 0.42,
    validationStatus: 'parcial',
    findings:
      '[DEMO · sin OPENAI_API_KEY] Este resultado es simulado para mostrar el flujo al cliente: identificación, fuentes, discrepancias y ficha editable. Al pegar la API key real en apps/api/.env y reiniciar, esta misma acción usará OpenAI.',
    sources: [
      'DEMO — no es una fuente real',
      'Al configurar OpenAI aparecerán fuentes de la investigación'
    ],
    discrepancies: [
      'Modo demo: no se contrastó información real en internet',
      imageFindings?.length
        ? 'Hubo imágenes; el análisis visual también es simulado'
        : 'Sin imágenes de referencia en esta corrida'
    ],
    sheet: {
      title,
      description: `Descripción de demostración para “${name}”. En producción la IA redactará título, beneficios y specs con evidencia. SKU y stock los completa el equipo (nunca la IA).`,
      brand,
      model,
      features: [
        'Característica demo 1 (ejemplo)',
        'Característica demo 2 (ejemplo)',
        'Listo para revisión humana antes de Shopify'
      ],
      specs: [
        { name: 'Color', value: 'Negro (ejemplo)', confirmed: false },
        { name: 'Garantía', value: '1 año (ejemplo)', confirmed: false },
        { name: 'UPC', value: upc || 'pendiente de verificar', confirmed: Boolean(upc) }
      ],
      upc
    },
    demo: true
  };
}

export async function extractFromImage(input, mimeType) {
  if (isDemoAi()) return demoExtractFromImage();
  const dataUrl = toDataUrl(input, mimeType);
  return callOpenAi([
    {
      role: 'system',
      content:
        'Eres un asistente de identificación de productos retail. Extrae solo lo visible. No inventes. Responde JSON.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analiza la imagen y responde JSON: { "extractedText": string, "brand": string|null, "model": string|null, "productHints": string }'
        },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    }
  ]);
}

export async function researchProduct({ input, imageFindings }) {
  if (isDemoAi()) return demoResearchProduct({ input, imageFindings });
  return callOpenAi([
    {
      role: 'system',
      content: `Eres investigador de productos para TechnStore (retail México).
Reglas:
- No inventes especificaciones sin evidencia.
- Marca campos dudosos como no confirmados.
- Responde SOLO JSON con esta forma:
{
  "identifiedName": string,
  "identifiedBrand": string|null,
  "identifiedModel": string|null,
  "confidenceScore": number,
  "validationStatus": "confirmado"|"parcial"|"no_confirmado",
  "findings": string,
  "sources": string[],
  "discrepancies": string[],
  "sheet": {
    "title": string,
    "description": string,
    "brand": string|null,
    "model": string|null,
    "features": string[],
    "specs": [{"name": string, "value": string, "confirmed": boolean}],
    "upc": string|null
  }
}`
    },
    {
      role: 'user',
      content: JSON.stringify({
        input,
        imageFindings: imageFindings || null,
        instruction:
          'Identifica el producto, contrasta con la entrada y genera ficha. Si falta evidencia, déjalo explícito.'
      })
    }
  ]);
}
