'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, type FC } from 'react';

const Index: FC = () => {
    const router = useRouter();

    useEffect(() => {
        const redirect = async () => {
            try {
                await axios.post('/api/verify');
                const currentTime = Date.now();
                router.push(`/contact/${currentTime}`);
            } catch {
                //
            }
        };
        redirect();
    }, [router]);

    return null;
};

export default Index;
