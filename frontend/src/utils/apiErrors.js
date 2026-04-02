export function extractApiErrors(
  error,
  fallbackMessage = "Bir hata oluştu. Lütfen tekrar deneyin.",
) {
  const responseData = error?.response?.data;

  if (!responseData) {
    return { general: fallbackMessage };
  }

  if (typeof responseData === "string") {
    return { general: responseData };
  }

  if (typeof responseData.detail === "string") {
    return { general: responseData.detail };
  }

  if (typeof responseData.error === "string") {
    return { general: responseData.error };
  }

  return responseData;
}
