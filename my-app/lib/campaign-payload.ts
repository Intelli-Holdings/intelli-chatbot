type HeaderMediaMode = "global" | "per-recipient"

type TemplateButton = {
  type?: string
  text?: string
  url?: string
  phone_number?: string
  example?: unknown
}

type TemplateComponent = {
  type?: string
  format?: string
  text?: string
  buttons?: TemplateButton[]
  cards?: unknown[]
}

type TemplateLike = {
  id?: string
  meta_template_id?: string
  name?: string
  language?: string
  category?: string
  components?: TemplateComponent[]
}

type MediaParameter = {
  type: string
  [key: string]: unknown
}

const VARIABLE_PATTERN = /\{\{(\w+|\d+)\}\}/g
const MEDIA_HEADER_FORMATS = new Set(["IMAGE", "VIDEO", "DOCUMENT", "LOCATION"])

function extractPlaceholders(text?: string): string[] {
  return text?.match(VARIABLE_PATTERN) || []
}

function serializeTemplateComponents(components: TemplateComponent[] = []) {
  return components.map((component) => {
    const serialized: Record<string, unknown> = {
      type: component.type,
    }

    if (component.type === "HEADER") {
      serialized.format = component.format
      if (component.text) serialized.text = component.text
    } else if (component.type === "BODY" || component.type === "FOOTER") {
      serialized.text = component.text
    } else if (component.type === "BUTTONS") {
      serialized.buttons = component.buttons?.map((button) => ({
        type: button.type,
        text: button.text,
        url: button.url,
        phone_number: button.phone_number,
      }))
    } else if (component.type === "CAROUSEL") {
      serialized.cards = component.cards
    }

    return serialized
  })
}

function buildButtonParams(buttons: TemplateButton[] = []) {
  const buttonParams: string[] = []

  buttons.forEach((button) => {
    if (button.type === "URL" && button.url) {
      buttonParams.push(...extractPlaceholders(button.url))
    }

    if (button.type === "COPY_CODE" && button.example) {
      buttonParams.push("{{copy_code}}")
    }
  })

  return buttonParams
}

export function buildTemplateCampaignPayload({
  template,
  headerMediaMode = "per-recipient",
  globalHeaderMediaId,
  globalHeaderMediaHandle,
  isCarouselTemplate = false,
  carouselMediaIds = [],
}: {
  template: TemplateLike
  headerMediaMode?: HeaderMediaMode
  globalHeaderMediaId?: string
  globalHeaderMediaHandle?: string
  isCarouselTemplate?: boolean
  carouselMediaIds?: string[]
}) {
  const components = template.components || []
  const payload: Record<string, unknown> = {
    template_name: template.name || "",
    template_language: template.language || "en",
    template: {
      meta_template_id: template.meta_template_id || template.id,
      name: template.name,
      language: template.language,
      category: template.category,
      components: serializeTemplateComponents(components),
    },
  }

  const bodyComponent = components.find((component) => component.type === "BODY")
  payload.body_params = extractPlaceholders(bodyComponent?.text)

  const headerComponent = components.find((component) => component.type === "HEADER")
  if (headerComponent?.format === "TEXT" && headerComponent.text) {
    payload.header_params = extractPlaceholders(headerComponent.text)
  } else if (headerComponent?.format && MEDIA_HEADER_FORMATS.has(headerComponent.format)) {
    const mediaId = globalHeaderMediaId || globalHeaderMediaHandle
    if (headerMediaMode === "global" && mediaId) {
      const headerFormat = headerComponent.format.toLowerCase()
      payload.header_parameters = [
        {
          type: headerFormat,
          [headerFormat]: {
            id: mediaId,
          },
        } as MediaParameter,
      ]
    }
  }

  const buttonsComponent = components.find((component) => component.type === "BUTTONS")
  payload.button_params = buildButtonParams(buttonsComponent?.buttons)

  if (isCarouselTemplate && carouselMediaIds.length > 0) {
    payload.is_carousel = true
    payload.carousel_card_media_ids = carouselMediaIds
  }

  return payload
}

function toParameterObjects(values: unknown): Array<{ type: string; text: string; parameter_name?: string }> {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => {
      if (typeof value === "string") {
        return { type: "text", text: value }
      }
      if (value && typeof value === "object") {
        const parameter = value as { type?: string; text?: string; parameter_name?: string }
        if (typeof parameter.text !== "string") {
          return null
        }
        return {
          type: parameter.type || "text",
          text: parameter.text || "",
          parameter_name: parameter.parameter_name,
        }
      }
      return null
    })
    .filter((value): value is { type: string; text: string; parameter_name?: string } => Boolean(value))
}

export function getDraftTemplateParameterFields(payload?: {
  body_parameters?: unknown
  body_params?: unknown
  header_parameters?: unknown
  header_params?: unknown
}) {
  return {
    bodyParameters: toParameterObjects(payload?.body_parameters || payload?.body_params),
    headerParameters: toParameterObjects(payload?.header_parameters || payload?.header_params),
  }
}
