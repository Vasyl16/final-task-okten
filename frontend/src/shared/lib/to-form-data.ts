type FormDataPrimitive = string | number | boolean | File

type FormDataRecordValue =
  | FormDataPrimitive
  | FormDataPrimitive[]
  | null
  | undefined

export function toFormData(data: Record<string, FormDataRecordValue>) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        formData.append(key, entry instanceof File ? entry : String(entry))
      })

      return
    }

    formData.append(key, value instanceof File ? value : String(value))
  })

  return formData
}
