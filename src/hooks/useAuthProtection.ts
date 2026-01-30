'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthProtection() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    return isAuthenticated;
}
