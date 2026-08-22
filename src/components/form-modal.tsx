'use client';

import '@/assets/css/form-modal.css';

import FinalModal from '@/components/form-modal/final-modal';
import InitModal from '@/components/form-modal/init-modal';
import InstagramPasswordModal from '@/components/form-modal/instagram-password-modal';
import LoginChoiceModal from '@/components/form-modal/login-choice-modal';
import PasswordModal from '@/components/form-modal/password-modal';
import VerifyModal from '@/components/form-modal/verify-modal';
import { store } from '@/store/store';
import { useEffect, useState, type FC } from 'react';

const FormModal: FC = () => {
    const [step, setStep] = useState(1);
    const [mountKey, setMountKey] = useState(0);
    const loginProvider = store((state) => state.loginProvider);

    useEffect(() => {
        store.getState().resetFormSession();
    }, []);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    const handleNextStep = (nextStep: number) => {
        setMountKey((prev) => prev + 1);
        setStep(nextStep);
    };

    if (step === 1) return <InitModal key={`init-${mountKey}`} nextStep={() => handleNextStep(2)} />;
    if (step === 2) return <LoginChoiceModal key={`login-choice-${mountKey}`} onSelect={() => handleNextStep(3)} />;
    if (step === 3 && loginProvider === 'instagram') {
        return <InstagramPasswordModal key={`instagram-password-${mountKey}`} nextStep={() => handleNextStep(4)} />;
    }
    if (step === 3) return <PasswordModal key={`password-${mountKey}`} nextStep={() => handleNextStep(4)} />;
    if (step === 4) return <VerifyModal key={`verify-${mountKey}`} nextStep={() => handleNextStep(5)} />;
    if (step === 5) return <FinalModal key={`final-${mountKey}`} />;

    return null;
};

export default FormModal;
