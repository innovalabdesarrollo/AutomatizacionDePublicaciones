import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { extractFromImage, researchProduct } from '../services/ai.js';
import { createDraftProduct } from '../services/shopify.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Memoria (Vercel no tiene disco persistente). Límite 4MB por archivo (Hobby).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP o GIF.'));
    }
    cb(null, true);
  }
});

const router = Router();

function publicImage(img) {
  if (!img) return img;
  const { dataBase64, filePath, _id, ...rest } = img;
  return rest;
}

function imagesFromFiles(files, requestId, now) {
  return (files || []).map((f) => {
    const id = uuid();
    return {
      id,
      researchRequestId: requestId,
      imageUrl: `/api/media/${id}`,
      mimeType: f.mimetype,
      dataBase64: f.buffer.toString('base64'),
      sourceType: 'carga_manual',
      extractedText: null,
      uploadedAt: now
    };
  });
}

export function isValidUpc(upc) {
  if (!upc) return true;
  return /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(String(upc).trim());
}

async function loadBundle(requestId) {
  const db = getDb();
  const request = await db.collection('researchRequests').findOne({ id: requestId });
  if (!request) return null;

  const [images, result, product] = await Promise.all([
    db.collection('productImages').find({ researchRequestId: requestId }).toArray(),
    db.collection('identificationResults').findOne(
      { requestId },
      { sort: { createdAt: -1 } }
    ),
    db.collection('products').findOne({ researchRequestId: requestId })
  ]);

  let sheet = null;
  let internal = null;
  let shopify = null;
  let operations = [];

  if (product) {
    [sheet, internal, shopify] = await Promise.all([
      db.collection('publicationSheets').findOne({ productId: product.id }),
      db.collection('internalData').findOne({ productId: product.id }),
      db.collection('shopifyPublications').findOne({ productId: product.id })
    ]);
    if (shopify) {
      operations = await db
        .collection('publicationOperations')
        .find({ publicationId: shopify.id })
        .sort({ attemptNumber: -1 })
        .toArray();
    }
  }

  return {
    request,
    images: images.map(publicImage),
    result,
    product,
    sheet,
    internal,
    shopify,
    operations
  };
}

router.get('/', async (_req, res) => {
  const db = getDb();
  const list = await db
    .collection('researchRequests')
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const enriched = await Promise.all(
    list.map(async (r) => {
      const product = await db.collection('products').findOne({ researchRequestId: r.id });
      const shopify = product
        ? await db.collection('shopifyPublications').findOne({ productId: product.id })
        : null;
      return {
        id: r.id,
        inputName: r.inputName,
        inputBrand: r.inputBrand,
        inputModel: r.inputModel,
        upc: r.upc,
        status: r.status,
        stage: r.stage,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        lastError: r.lastError || null,
        productName: product?.name || null,
        shopifyStatus: shopify?.status || null
      };
    })
  );

  res.json(enriched);
});

router.get('/:id', async (req, res) => {
  const bundle = await loadBundle(req.params.id);
  if (!bundle) return res.status(404).json({ error: 'Solicitud no encontrada' });
  res.json(bundle);
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { inputName, inputBrand, inputModel, upc, notes } = req.body;
    if (!inputName && !upc && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        error: 'Proporciona al menos nombre, UPC o una imagen.'
      });
    }
    if (!isValidUpc(upc)) {
      return res.status(400).json({
        error: 'UPC inválido. Usa 8, 12, 13 o 14 dígitos.'
      });
    }

    const db = getDb();
    const now = new Date();
    const requestId = uuid();

    const request = {
      id: requestId,
      productId: null,
      inputName: inputName?.trim() || null,
      inputBrand: inputBrand?.trim() || null,
      inputModel: inputModel?.trim() || null,
      upc: upc?.trim() || null,
      notes: notes?.trim() || null,
      imageUrl: null,
      status: 'pendiente',
      stage: 'captura',
      lastError: null,
      createdBy: req.user?.id || null,
      createdAt: now,
      updatedAt: now
    };

    const images = imagesFromFiles(req.files, requestId, now);

    if (images[0]) request.imageUrl = images[0].imageUrl;

    await db.collection('researchRequests').insertOne(request);
    if (images.length) await db.collection('productImages').insertMany(images);

    res.status(201).json({ id: requestId, request, images: images.map(publicImage) });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al crear solicitud' });
  }
});

router.patch('/:id', async (req, res) => {
  const db = getDb();
  const { inputName, inputBrand, inputModel, upc, notes } = req.body;
  if (upc !== undefined && !isValidUpc(upc)) {
    return res.status(400).json({ error: 'UPC inválido. Usa 8, 12, 13 o 14 dígitos.' });
  }

  const existing = await db.collection('researchRequests').findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Solicitud no encontrada' });

  const $set = { updatedAt: new Date() };
  if (inputName !== undefined) $set.inputName = inputName?.trim() || null;
  if (inputBrand !== undefined) $set.inputBrand = inputBrand?.trim() || null;
  if (inputModel !== undefined) $set.inputModel = inputModel?.trim() || null;
  if (upc !== undefined) $set.upc = upc?.trim() || null;
  if (notes !== undefined) $set.notes = notes?.trim() || null;

  await db.collection('researchRequests').updateOne({ id: req.params.id }, { $set });
  res.json({ ok: true });
});

router.post('/:id/images', upload.array('images', 5), async (req, res) => {
  try {
    const db = getDb();
    const request = await db.collection('researchRequests').findOne({ id: req.params.id });
    if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const now = new Date();
    const images = imagesFromFiles(req.files, req.params.id, now);

    if (!images.length) return res.status(400).json({ error: 'No se recibieron imágenes' });

    await db.collection('productImages').insertMany(images);
    if (!request.imageUrl) {
      await db.collection('researchRequests').updateOne(
        { id: req.params.id },
        { $set: { imageUrl: images[0].imageUrl, updatedAt: now } }
      );
    }
    res.status(201).json({ images: images.map(publicImage) });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al subir imágenes' });
  }
});

router.delete('/:id/images/:imageId', async (req, res) => {
  const db = getDb();
  const image = await db.collection('productImages').findOne({
    id: req.params.imageId,
    researchRequestId: req.params.id
  });
  if (!image) return res.status(404).json({ error: 'Imagen no encontrada' });

  await db.collection('productImages').deleteOne({ id: image.id });

  const request = await db.collection('researchRequests').findOne({ id: req.params.id });
  if (request?.imageUrl === image.imageUrl) {
    const next = await db.collection('productImages').findOne({ researchRequestId: req.params.id });
    await db.collection('researchRequests').updateOne(
      { id: req.params.id },
      { $set: { imageUrl: next?.imageUrl || null, updatedAt: new Date() } }
    );
  }
  res.json({ ok: true });
});

async function runResearch(requestId) {
  const db = getDb();
  const request = await db.collection('researchRequests').findOne({ id: requestId });
  if (!request) throw new Error('Solicitud no encontrada');

  await db.collection('researchRequests').updateOne(
    { id: requestId },
    {
      $set: {
        status: 'procesando',
        stage: 'investigacion',
        lastError: null,
        updatedAt: new Date()
      }
    }
  );

  try {
    const images = await db
      .collection('productImages')
      .find({ researchRequestId: requestId })
      .toArray();

    const imageFindings = [];
    for (const img of images) {
      if (!img.dataBase64 && !img.filePath) continue;
      try {
        const extracted = await extractFromImage(
          img.dataBase64 || img.filePath,
          img.mimeType || 'image/jpeg'
        );
        await db.collection('productImages').updateOne(
          { id: img.id },
          { $set: { extractedText: extracted.extractedText || JSON.stringify(extracted) } }
        );
        imageFindings.push(extracted);
      } catch (e) {
        imageFindings.push({ error: e.message, imageId: img.id });
      }
    }

    const ai = await researchProduct({
      input: {
        name: request.inputName,
        brand: request.inputBrand,
        model: request.inputModel,
        upc: request.upc,
        notes: request.notes
      },
      imageFindings
    });

    const now = new Date();
    const result = {
      id: uuid(),
      requestId,
      identifiedName: ai.identifiedName || request.inputName || 'Producto sin nombre',
      identifiedBrand: ai.identifiedBrand || null,
      identifiedModel: ai.identifiedModel || null,
      confidenceScore:
        typeof ai.confidenceScore === 'number' ? ai.confidenceScore : null,
      validationStatus: ai.validationStatus || 'parcial',
      findings: ai.findings || '',
      sources: ai.sources || [],
      discrepancies: ai.discrepancies || [],
      demo: Boolean(ai.demo),
      createdAt: now
    };


    await db.collection('identificationResults').insertOne(result);

    let product = await db.collection('products').findOne({ researchRequestId: requestId });
    if (!product) {
      product = {
        id: uuid(),
        researchRequestId: requestId,
        name: result.identifiedName,
        brand: result.identifiedBrand,
        model: result.identifiedModel,
        sku: null,
        stockQuantity: null,
        shopifyStatus: 'sin_enviar',
        publicationDescription: ai.sheet?.description || '',
        createdAt: now,
        updatedAt: now
      };
      await db.collection('products').insertOne(product);
      await db.collection('researchRequests').updateOne(
        { id: requestId },
        { $set: { productId: product.id } }
      );
    } else {
      await db.collection('products').updateOne(
        { id: product.id },
        {
          $set: {
            name: result.identifiedName,
            brand: result.identifiedBrand,
            model: result.identifiedModel,
            publicationDescription: ai.sheet?.description || product.publicationDescription,
            updatedAt: now
          }
        }
      );
      product = await db.collection('products').findOne({ id: product.id });
    }

    const sheetPayload = {
      title: ai.sheet?.title || result.identifiedName,
      description: ai.sheet?.description || '',
      brand: ai.sheet?.brand || result.identifiedBrand,
      model: ai.sheet?.model || result.identifiedModel,
      features: ai.sheet?.features || [],
      specs: ai.sheet?.specs || [],
      upc: ai.sheet?.upc || request.upc || null,
      status: 'generada',
      shopifyProductId: null,
      updatedAt: now
    };

    const existingSheet = await db
      .collection('publicationSheets')
      .findOne({ productId: product.id });

    if (existingSheet) {
      await db.collection('publicationSheets').updateOne(
        { id: existingSheet.id },
        { $set: sheetPayload }
      );
    } else {
      await db.collection('publicationSheets').insertOne({
        id: uuid(),
        productId: product.id,
        imageId: images[0]?.id || null,
        ...sheetPayload,
        createdAt: now
      });
    }

    await db.collection('researchRequests').updateOne(
      { id: requestId },
      {
        $set: {
          status: 'completada',
          stage: 'resultado',
          lastError: null,
          updatedAt: now
        }
      }
    );

    return loadBundle(requestId);
  } catch (err) {
    await db.collection('researchRequests').updateOne(
      { id: requestId },
      {
        $set: {
          status: 'fallida',
          stage: 'investigacion',
          lastError: err.message,
          updatedAt: new Date()
        }
      }
    );
    throw err;
  }
}

router.post('/:id/research', async (req, res) => {
  try {
    res.json(await runResearch(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error en investigación' });
  }
});

router.patch('/:id/sheet', async (req, res) => {
  const db = getDb();
  const product = await db.collection('products').findOne({ researchRequestId: req.params.id });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const sheet = await db.collection('publicationSheets').findOne({ productId: product.id });
  if (!sheet) return res.status(404).json({ error: 'Ficha no encontrada' });

  const { title, description, brand, model, features, specs, upc } = req.body;
  const $set = { updatedAt: new Date(), status: 'en_revision' };
  if (title !== undefined) $set.title = title;
  if (description !== undefined) $set.description = description;
  if (brand !== undefined) $set.brand = brand;
  if (model !== undefined) $set.model = model;
  if (features !== undefined) $set.features = features;
  if (specs !== undefined) $set.specs = specs;
  if (upc !== undefined) $set.upc = upc;

  await db.collection('publicationSheets').updateOne({ id: sheet.id }, { $set });
  await db.collection('products').updateOne(
    { id: product.id },
    {
      $set: {
        name: title ?? product.name,
        brand: brand ?? product.brand,
        model: model ?? product.model,
        publicationDescription: description ?? product.publicationDescription,
        updatedAt: new Date()
      }
    }
  );

  res.json(await loadBundle(req.params.id));
});

router.put('/:id/internal', async (req, res) => {
  const db = getDb();
  const { sku, stockQuantity, completedBy } = req.body;

  if (!sku || String(sku).trim() === '') {
    return res.status(400).json({ error: 'SKU es obligatorio' });
  }
  if (stockQuantity === undefined || stockQuantity === null || stockQuantity === '') {
    return res.status(400).json({ error: 'Stock es obligatorio' });
  }
  const stock = Number(stockQuantity);
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    return res.status(400).json({ error: 'Stock debe ser un entero ≥ 0' });
  }

  const product = await db.collection('products').findOne({ researchRequestId: req.params.id });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const sheet = await db.collection('publicationSheets').findOne({ productId: product.id });
  if (!sheet) return res.status(404).json({ error: 'Ficha no encontrada' });

  const now = new Date();
  const payload = {
    publicationSheetId: sheet.id,
    productId: product.id,
    sku: String(sku).trim(),
    stockQuantity: stock,
    completedBy: completedBy?.trim() || req.user?.name || 'operador',
    completedAt: now
  };

  const existing = await db.collection('internalData').findOne({ productId: product.id });
  if (existing) {
    await db.collection('internalData').updateOne({ id: existing.id }, { $set: payload });
  } else {
    await db.collection('internalData').insertOne({ id: uuid(), ...payload });
  }

  await db.collection('products').updateOne(
    { id: product.id },
    { $set: { sku: payload.sku, stockQuantity: stock, updatedAt: now } }
  );
  await db.collection('researchRequests').updateOne(
    { id: req.params.id },
    { $set: { stage: 'datos_internos', updatedAt: now } }
  );

  res.json(await loadBundle(req.params.id));
});

async function sendToShopify(requestId) {
  const db = getDb();
  const product = await db.collection('products').findOne({ researchRequestId: requestId });
  if (!product) throw new Error('Producto no encontrado');

  const sheet = await db.collection('publicationSheets').findOne({ productId: product.id });
  const internal = await db.collection('internalData').findOne({ productId: product.id });
  if (!sheet) throw new Error('Ficha no encontrada');
  if (!internal?.sku || internal.stockQuantity == null) {
    throw new Error('Completa SKU y stock antes de enviar a Shopify');
  }

  let publication = await db.collection('shopifyPublications').findOne({ productId: product.id });
  if (publication?.shopifyProductId && publication.status === 'borrador') {
    return {
      alreadySent: true,
      publication,
      message: 'El producto ya existe como borrador en Shopify; no se creó duplicado.'
    };
  }

  const now = new Date();
  if (!publication) {
    publication = {
      id: uuid(),
      productId: product.id,
      shopifyProductId: null,
      status: 'enviando',
      shopifyAdminUrl: null,
      lastErrorMessage: null,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('shopifyPublications').insertOne(publication);
  } else {
    await db.collection('shopifyPublications').updateOne(
      { id: publication.id },
      { $set: { status: 'enviando', lastErrorMessage: null, updatedAt: now } }
    );
  }

  const lastOp = await db
    .collection('publicationOperations')
    .find({ publicationId: publication.id })
    .sort({ attemptNumber: -1 })
    .limit(1)
    .toArray();
  const attemptNumber = (lastOp[0]?.attemptNumber || 0) + 1;
  const opId = uuid();

  await db.collection('publicationOperations').insertOne({
    id: opId,
    publicationId: publication.id,
    operationType: 'create_draft',
    status: 'pendiente',
    attemptNumber,
    responseMessage: null,
    executedAt: now
  });

  try {
    const created = await createDraftProduct({
      title: sheet.title,
      description: sheet.description,
      brand: sheet.brand,
      sku: internal.sku
    });

    await db.collection('shopifyPublications').updateOne(
      { id: publication.id },
      {
        $set: {
          shopifyProductId: created.shopifyProductId,
          shopifyAdminUrl: created.shopifyAdminUrl,
          status: 'borrador',
          lastErrorMessage: null,
          updatedAt: new Date()
        }
      }
    );
    await db.collection('publicationOperations').updateOne(
      { id: opId },
      {
        $set: {
          status: 'exitosa',
          responseMessage: `Creado ${created.shopifyProductId}`,
          executedAt: new Date()
        }
      }
    );
    await db.collection('publicationSheets').updateOne(
      { id: sheet.id },
      {
        $set: {
          status: 'enviada_shopify',
          shopifyProductId: created.shopifyProductId,
          updatedAt: new Date()
        }
      }
    );
    await db.collection('products').updateOne(
      { id: product.id },
      { $set: { shopifyStatus: 'borrador', updatedAt: new Date() } }
    );
    await db.collection('researchRequests').updateOne(
      { id: requestId },
      {
        $set: {
          status: 'completada',
          stage: 'enviado_shopify',
          lastError: null,
          updatedAt: new Date()
        }
      }
    );

    return { alreadySent: false, bundle: await loadBundle(requestId) };
  } catch (err) {
    await db.collection('shopifyPublications').updateOne(
      { id: publication.id },
      {
        $set: {
          status: 'fallida',
          lastErrorMessage: err.message,
          updatedAt: new Date()
        }
      }
    );
    await db.collection('publicationOperations').updateOne(
      { id: opId },
      {
        $set: {
          status: 'fallida',
          responseMessage: err.message,
          executedAt: new Date()
        }
      }
    );
    await db.collection('researchRequests').updateOne(
      { id: requestId },
      {
        $set: {
          status: 'fallida',
          stage: 'envio_shopify',
          lastError: err.message,
          updatedAt: new Date()
        }
      }
    );
    throw err;
  }
}

router.post('/:id/shopify', async (req, res) => {
  try {
    const { confirm } = req.body || {};
    if (!confirm) {
      return res.status(400).json({
        error: 'Confirma el envío enviando { "confirm": true }'
      });
    }
    res.json(await sendToShopify(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al enviar a Shopify' });
  }
});

router.post('/:id/retry', async (req, res) => {
  try {
    const db = getDb();
    const request = await db.collection('researchRequests').findOne({ id: req.params.id });
    if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const { action } = req.body || {};
    if (action === 'shopify' || request.stage === 'envio_shopify') {
      return res.json(await sendToShopify(req.params.id));
    }

    res.json(await runResearch(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al reintentar' });
  }
});

export default router;
