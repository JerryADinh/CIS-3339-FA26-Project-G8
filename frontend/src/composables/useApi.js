import { ref } from 'vue';

// reusable composable for managing API requests
export function useAPI(apiCall, initialData = null) {

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
            error.value = err;
            throw err;
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