/**
 * Standardized error handling utility
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with non-2xx status code
    return error.response.data?.message || `Error: ${error.response.status}`
  } else if (error.request) {
    // Request was made but no response received
    return "No response from server. Please check your network connection."
  } else {
    // Something else went wrong
    return error.message || "An unexpected error occurred."
  }
}
