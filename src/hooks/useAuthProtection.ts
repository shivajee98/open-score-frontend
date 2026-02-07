'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuthProtection() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/');
        } else {
            setIsAuthenticated(true);
        }
    }, [navigate]);

    return isAuthenticated;
}
