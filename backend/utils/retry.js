// utils/retry.js
const retry = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// In your component
const handleStartAssessment = async () => {
    try {
        await retry(async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            setLoading(true);

            // ... rest of your implementation ...
        }, 3, 1000);
    } catch (error) {
        // Handle final error
    } finally {
        setLoading(false);
    }
};