const getBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return url.endsWith('/api') ? url : `${url}/api`;
};

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
    };
};

const api = {
    get: async (url: string) => {
        const res = await fetch(`${getBaseUrl()}${url}`, {
            headers: getHeaders(),
        });
        if (res.status === 204) return { data: {} };
        const data = await res.json();
        if (!res.ok) throw { response: { data, status: res.status } };
        return { data };
    },
    post: async (url: string, body: any) => {
        const res = await fetch(`${getBaseUrl()}${url}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (res.status === 204) return { data: {} };
        const data = await res.json();
        if (!res.ok) throw { response: { data, status: res.status } };
        return { data };
    },
    put: async (url: string, body?: any) => {
        const res = await fetch(`${getBaseUrl()}${url}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 204) return { data: {} };
        const data = await res.json();
        if (!res.ok) throw { response: { data, status: res.status } };
        return { data };
    },
    delete: async (url: string, config?: { data?: any }) => {
        const res = await fetch(`${getBaseUrl()}${url}`, {
            method: 'DELETE',
            headers: getHeaders(),
            body: config?.data ? JSON.stringify(config.data) : undefined,
        });
        if (res.status === 204) return { data: {} };
        const data = await res.json();
        if (!res.ok) throw { response: { data, status: res.status } };
        return { data };
    }
};


export default api;
