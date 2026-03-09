export function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        let jsonPayload;
        if (typeof window !== 'undefined') {
            jsonPayload = decodeURIComponent(
                window
                    .atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
        } else {
            jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        }

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
