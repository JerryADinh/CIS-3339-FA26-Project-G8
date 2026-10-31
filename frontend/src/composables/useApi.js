
import { ref } from 'vue';

// Reusable composable for managing API requests
export function useApi(apiCall, initialData = null) {

    const data = ref(initialData);
    const loading = ref(false);
    const error = ref(null);

    const execute = async (...args) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiCall(...args);
            data.value = response;
            return response;
        } catch (err) {
            // Store the error so components can display it
            error.value = err instanceof Error
                ? err
                : new Error(String(err));

            // Prevent unhandled promise rejection
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        data,
        loading,
        error,
        execute
    };
}
