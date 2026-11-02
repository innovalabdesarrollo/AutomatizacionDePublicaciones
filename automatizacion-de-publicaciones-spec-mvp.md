# Automatizacion de publicaciones — Especificación MVP

> Exportado desde **Traductor Dev** · 2/11/2026, 6:46:26 p.m.

## Resumen del proyecto

| Campo | Valor |
| --- | --- |
| Estado | draft |
| Presupuesto | $0 |
| Tipo de sistema | — |
| Plazo MVP | — |

### Objetivo

Agilizar y estandarizar la creación de publicaciones de productos de TechnStore mediante inteligencia artificial. El sistema deberá identificar e investigar un producto a partir de diferentes datos de entrada, como nombre, marca y modelo, código UPC, imagen del producto o información proporcionada por el usuario.
Una vez encontrada y validada la información del producto, el sistema deberá generar automáticamente la información necesaria para la publicación y crear el producto directamente en Shopify en estado de borrador, dejándolo listo para revisión manual.

El equipo de TechnStore revisará la información generada, realizará las correcciones necesarias y agregará manualmente los datos internos que no deben ser determinados por la inteligencia artificial, principalmente el SKU y la cantidad de stock disponible, antes de publicar definitivamente el producto.

El objetivo es reducir el tiempo invertido en investigación y captura de información, disminuir errores y mantener publicaciones estandarizadas sin eliminar la supervisión humana.

### Propuesta de solución

Desarrollar una herramienta interna para TechnStore que automatice el proceso de investigación y preparación de productos para publicación.

El usuario podrá ingresar información básica del producto mediante diferentes métodos, principalmente nombre y modelo, código UPC, imagen o datos disponibles del artículo.

Desarrollar una herramienta interna para TechnStore que automatice la investigación, generación y captura inicial de publicaciones de productos.

Flujo propuesto del MVP:

El usuario proporciona información inicial del producto mediante alguno de los métodos disponibles: nombre y modelo, código UPC, datos básicos del artículo o una imagen del producto.
Si se proporciona una imagen, el sistema utilizará inteligencia artificial para analizarla, identificar visualmente el producto y extraer pistas útiles como marca, modelo, tipo de artículo o textos visibles en el empaque o etiqueta.
La inteligencia artificial buscará información confiable del producto en diferentes fuentes y la contrastará con los datos de entrada.
El sistema analizará, validará y estructurará la información encontrada, evitando inventar especificaciones cuando no exista evidencia suficiente.
Se generará automáticamente la ficha del producto con título, marca, modelo, descripción, características principales, especificaciones técnicas, UPC cuando pueda verificarse y demás información necesaria para la publicación.
La herramienta se conectará con Shopify y creará automáticamente el producto en estado de borrador, sin publicarlo todavía.
El personal de TechnStore revisará manualmente la publicación creada en Shopify.
Durante esta revisión se podrán corregir datos y agregar información interna, principalmente SKU y stock disponible.
Una vez aprobada la publicación por una persona del equipo, se podrá activar en Shopify y continuar con el flujo normal hacia los demás canales de venta.

De esta manera, la inteligencia artificial realizará las tareas repetitivas de identificación, investigación, redacción y captura, mientras que TechnStore conservará el control final de cada publicación antes de poner un producto a la venta.

## Actores del sistema (4)

### Operador de publicaciones

Usuario interno de TechnStore que ingresa los datos iniciales del producto, inicia la investigación asistida por IA y completa o corrige la información necesaria para preparar la publicación.

### Revisor y aprobador de publicaciones

Usuario interno responsable de validar la ficha generada, agregar datos internos como SKU y stock, corregir información y aprobar la activación del producto.

### Motor de inteligencia artificial

Componente del sistema que analiza entradas textuales e imágenes, investiga y contrasta información, identifica el producto y genera la ficha estructurada para publicación.

### Integración con Shopify

Sistema externo que recibe la ficha validada, crea el producto en estado de borrador y permite continuar con su revisión y publicación.

## Historias de usuario (10)

### Ingresar datos iniciales del producto

- **Rol:** Operador de publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Operador de publicaciones**, quiero **poder registrar el nombre, marca, modelo, UPC  y otros datos disponibles del producto** para **pueda iniciar una investigación con información suficiente para identificarlo**.

**Criterios de aceptación:**

- El formulario permite capturar los datos disponibles sin exigir campos que el operador desconozca; valida formatos básicos como el UPC; permite guardar y continuar el proceso.

### Cargar una imagen del producto

- **Rol:** Operador de publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Operador de publicaciones**, quiero **poder cargar una o más imágenes del producto, empaque o etiqueta** para **la información visual pueda utilizarse para identificarlo y complementar la investigación**.

**Criterios de aceptación:**

- El sistema acepta formatos de imagen configurados, muestra una vista previa y permite eliminar o reemplazar archivos antes de iniciar la investigación.

### Iniciar investigación asistida

- **Rol:** Operador de publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Operador de publicaciones**, quiero **poder iniciar la investigación del producto después de ingresar los datos disponibles** para **el sistema analice y recopile información relevante automáticamente**.

**Criterios de aceptación:**

- Existe una acción clara para iniciar el proceso; se muestra el estado de la investigación; el operador recibe confirmación cuando finaliza o un mensaje accionable si ocurre un error.

### Consultar resultados de identificación

- **Rol:** Operador de publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Operador de publicaciones**, quiero **poder revisar el producto identificado y las fuentes o evidencias asociadas** para **pueda confirmar que la información corresponde al artículo antes de generar la publicación**.

**Criterios de aceptación:**

- Los resultados muestran la identidad propuesta, nivel o estado de validación, datos coincidentes y fuentes consultadas cuando estén disponibles; se advierten las discrepancias o datos no confirmados.

### Solicitar una nueva investigación con datos corregidos

- **Rol:** Operador de publicaciones
- **Prioridad:** Media
- **Formato:** Como **Operador de publicaciones**, quiero **poder corregir o complementar los datos de entrada y repetir la investigación** para **pueda resolver identificaciones ambiguas o resultados incorrectos sin crear una publicación errónea**.

**Criterios de aceptación:**

- El operador puede editar los datos iniciales, volver a ejecutar la investigación y distinguir el resultado actualizado del anterior.

### Revisar la ficha generada para publicación

- **Rol:** Operador de publicaciones
- **Prioridad:** Baja
- **Formato:** Como **Operador de publicaciones**, quiero **poder visualizar la ficha generada con título, descripción, características, especificaciones y datos identificados** para **pueda detectar omisiones o errores antes de enviarla a Shopify**.

**Criterios de aceptación:**

- La ficha presenta los campos generados de forma estructurada; los datos sin evidencia suficiente se identifican como no confirmados o pendientes; el operador puede editar los campos permitidos.

### Completar datos internos de la publicación

- **Rol:** Operador de publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Operador de publicaciones**, quiero **poder agregar o corregir los datos internos que no debe determinar la inteligencia artificial, como SKU y stock** para **la publicación quede preparada para la revisión y aprobación interna**.

**Criterios de aceptación:**

- El sistema dispone de campos editables para SKU y cantidad de stock, valida los formatos requeridos y señala los campos obligatorios pendientes antes de continuar.

### Enviar el producto a Shopify como borrador

- **Rol:** Operador de publicaciones
- **Prioridad:** Crítica
- **Formato:** Como **Operador de publicaciones**, quiero **poder enviar la ficha revisada a Shopify en estado de borrador** para **el equipo pueda continuar la revisión manual sin publicar el producto accidentalmente**.

**Criterios de aceptación:**

- La acción de envío requiere confirmación; el sistema crea o registra el producto en Shopify como borrador; muestra el resultado de la operación y el identificador o enlace disponible; nunca lo publica automáticamente.

### Consultar el estado del proceso de publicación

- **Rol:** Operador de publicaciones
- **Prioridad:** Media
- **Formato:** Como **Operador de publicaciones**, quiero **poder consultar el estado de cada producto desde el inicio de la investigación hasta su envío a Shopify** para **pueda dar seguimiento a los trabajos pendientes, completados o fallidos**.

**Criterios de aceptación:**

- La lista muestra al menos el producto, fecha de creación, etapa actual y estado; permite identificar investigaciones en curso, errores, borradores enviados y acciones pendientes.

### Reintentar operaciones fallidas

- **Rol:** Operador de publicaciones
- **Prioridad:** Media
- **Formato:** Como **Operador de publicaciones**, quiero **poder reintentar una investigación o envío a Shopify que haya fallado** para **pueda continuar el flujo sin capturar nuevamente toda la información**.

**Criterios de aceptación:**

- Los errores muestran una explicación comprensible y una acción de reintento cuando sea posible; el sistema conserva los datos capturados y evita crear duplicados al reintentar el envío.

## Modelo de datos (8 objetos)

### Producto

Representa el producto identificado y preparado para su publicación en Shopify.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del producto. |
| name | text | — | Sí | Nombre del producto preparado para la publicación. |
| brand | text | — | — | Marca identificada del producto. |
| model | text | — | — | Modelo o referencia comercial identificada. |
| sku | text | — | — | SKU interno agregado manualmente por el equipo. |
| stockQuantity | number | — | — | Cantidad de stock agregada manualmente. |
| shopifyStatus | text | — | Sí | Estado del producto en Shopify, por ejemplo borrador o publicado. |
| publicationDescription | textarea | — | — | Descripción generada y revisada para la publicación. |

### Solicitud de investigación

Representa una petición para identificar e investigar un producto a partir de la información proporcionada.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la solicitud de investigación. |
| productId | uuid | — | — | Producto asociado a la solicitud. |
| inputName | text | — | — | Nombre proporcionado inicialmente por el usuario. |
| inputBrand | text | — | — | Marca proporcionada inicialmente por el usuario. |
| inputModel | text | — | — | Modelo proporcionado inicialmente por el usuario. |
| upc | text | — | — | Código UPC proporcionado para la identificación. |
| imageUrl | url | — | — | URL de la imagen del producto cargada para investigación. |
| status | text | — | Sí | Estado de la solicitud, como pendiente, procesando, completada o fallida. |

### Resultado de identificación

Representa la información encontrada por la inteligencia artificial durante la identificación y validación del producto.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del resultado de identificación. |
| requestId | uuid | — | Sí | Solicitud de investigación que originó el resultado. |
| identifiedName | text | — | Sí | Nombre del producto identificado por la inteligencia artificial. |
| identifiedBrand | text | — | — | Marca identificada y validada. |
| identifiedModel | text | — | — | Modelo identificado y validado. |
| confidenceScore | decimal | — | — | Nivel de confianza de la identificación. |
| validationStatus | text | — | Sí | Estado de validación del resultado por el equipo revisor. |
| findings | textarea | — | — | Información encontrada durante la investigación del producto. |

### Imagen de producto

Representa una imagen utilizada como fuente de información para identificar o validar un producto.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la imagen de producto. |
| imageUrl | url | — | Sí | Ubicación de la imagen cargada para investigar o validar el producto. |
| sourceType | text | — | Sí | Origen de la imagen, como carga manual o fuente externa. |
| extractedText | textarea | — | — | Texto o información extraída de la imagen mediante inteligencia artificial. |
| uploadedAt | datetime | — | Sí | Fecha y hora en que se cargó la imagen. |

### Ficha de publicación

Representa el contenido generado y revisado que describe el producto antes de enviarlo a Shopify.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la ficha de publicación. |
| imageId | uuid | — | — | Imagen utilizada como fuente para la investigación del producto. |
| title | text | — | Sí | Título del producto generado y revisado para la publicación. |
| description | textarea | — | Sí | Descripción comercial del producto. |
| brand | text | — | — | Marca identificada del producto. |
| model | text | — | — | Modelo o referencia comercial identificada del producto. |
| status | text | — | Sí | Estado de la ficha, como generada, en revisión, aprobada o enviada a Shopify. |
| shopifyProductId | text | — | — | Identificador del producto creado en Shopify como borrador. |

### Dato interno de publicación

Representa información operativa que debe ser completada manualmente por el equipo, como el SKU o el stock.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del dato interno de publicación. |
| publicationSheetId | uuid | — | Sí | Ficha de publicación a la que pertenecen los datos internos. |
| sku | text | — | Sí | SKU asignado manualmente por el equipo. |
| stockQuantity | number | — | Sí | Cantidad de stock disponible asignada manualmente. |
| completedBy | text | — | — | Identificador o nombre del usuario que completó los datos internos. |
| completedAt | datetime | — | — | Fecha y hora en que se completaron los datos internos. |

### Publicación en Shopify

Representa el envío y estado del producto dentro de Shopify, incluido su estado inicial como borrador.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la publicación en Shopify. |
| shopifyProductId | text | — | — | Identificador del producto creado en Shopify. |
| status | text | — | Sí | Estado de la publicación, como borrador, enviada, publicada o fallida. |
| shopifyAdminUrl | url | — | — | URL de administración del producto en Shopify. |
| lastErrorMessage | textarea | — | — | Descripción del último error ocurrido durante la publicación. |
| createdAt | datetime | — | Sí | Fecha y hora de creación del registro de publicación. |
| updatedAt | datetime | — | Sí | Fecha y hora de la última actualización del estado de la publicación. |

### Operación de publicación

Representa una operación de comunicación con Shopify y su resultado, incluyendo posibles fallos y reintentos.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la operación de publicación. |
| publicationId | uuid | — | Sí | Identificador de la publicación en Shopify asociada. |
| operationType | text | — | Sí | Tipo de operación realizada contra Shopify. |
| status | text | — | Sí | Resultado de la operación, como pendiente, exitosa o fallida. |
| attemptNumber | number | — | Sí | Número de intento de ejecución de la operación. |
| responseMessage | textarea | — | — | Mensaje o respuesta devuelta por Shopify. |
| executedAt | datetime | — | — | Fecha y hora en que se ejecutó la operación. |

### Relaciones

- **Solicitud de investigación** → **Imagen de producto** (one-to-many): incluye imágenes de referencia
- **Solicitud de investigación** → **Resultado de identificación** (one-to-one): genera un resultado de identificación
- **Resultado de identificación** → **Imagen de producto** (many-to-many): utiliza y valida imágenes
- **Resultado de identificación** → **Producto** (one-to-one): identifica un producto
- **Producto** → **Ficha de publicación** (one-to-one): tiene una ficha de publicación
- **Producto** → **Dato interno de publicación** (one-to-one): tiene datos internos de publicación
- **Producto** → **Publicación en Shopify** (one-to-one): se publica en Shopify
- **Ficha de publicación** → **Publicación en Shopify** (one-to-one): proporciona el contenido de publicación
- **Publicación en Shopify** → **Operación de publicación** (one-to-many): registra operaciones de comunicación

## Épicas (1)

### Operador de publicaciones

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Operador de publicaciones.

**Tickets (10):** Completar datos internos de la publicación; Registrar datos iniciales del producto; Reintentar operaciones fallidas; Revisar ficha generada para publicación; Cargar imágenes del producto; Repetir investigación con datos corregidos; Consultar resultados de identificación; Iniciar investigación asistida del producto; Enviar producto a Shopify como borrador; Consultar estado del proceso de publicación

## Backlog de tickets (10)

### Operador de publicaciones

- **[Backlog]** Completar datos internos de la publicación _(task, Media)_
  - Rol: Operador de publicaciones · HU: Completar datos internos de la publicación
  - Implementación: QA
- **[Backlog]** Registrar datos iniciales del producto _(task, Media)_
  - Rol: Operador de publicaciones · HU: Ingresar datos iniciales del producto
  - Implementación: QA
- **[Backlog]** Reintentar operaciones fallidas _(task, Media)_
  - Rol: Operador de publicaciones · HU: Reintentar operaciones fallidas
  - Implementación: QA
- **[Backlog]** Revisar ficha generada para publicación _(task, Media)_
  - Rol: Operador de publicaciones · HU: Revisar la ficha generada para publicación
  - Implementación: QA
- **[Backlog]** Cargar imágenes del producto _(task, Media)_
  - Rol: Operador de publicaciones · HU: Cargar una imagen del producto
  - Implementación: QA
- **[Backlog]** Repetir investigación con datos corregidos _(task, Media)_
  - Rol: Operador de publicaciones · HU: Solicitar una nueva investigación con datos corregidos
  - Implementación: QA
- **[Backlog]** Consultar resultados de identificación _(task, Media)_
  - Rol: Operador de publicaciones · HU: Consultar resultados de identificación
  - Implementación: QA
- **[Backlog]** Iniciar investigación asistida del producto _(task, Media)_
  - Rol: Operador de publicaciones · HU: Iniciar investigación asistida
  - Implementación: QA
- **[Backlog]** Enviar producto a Shopify como borrador _(task, Media)_
  - Rol: Operador de publicaciones · HU: Enviar el producto a Shopify como borrador
  - Implementación: QA
- **[Backlog]** Consultar estado del proceso de publicación _(task, Media)_
  - Rol: Operador de publicaciones · HU: Consultar el estado del proceso de publicación
  - Implementación: QA

---

_Fin de la especificación._