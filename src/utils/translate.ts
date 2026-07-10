import axios from 'axios';

const CACHE_KEY = 'translation_cache';

/** ISO 3166-1 alpha-2 → Google Translate language code (primary language) */
const countryToLanguage: Record<string, string> = {
    // A
    AD: 'ca',
    AE: 'ar',
    AF: 'fa',
    AG: 'en',
    AI: 'en',
    AL: 'sq',
    AM: 'hy',
    AO: 'pt',
    AQ: 'en',
    AR: 'es',
    AS: 'en',
    AT: 'de',
    AU: 'en',
    AW: 'nl',
    AX: 'sv',
    AZ: 'az',
    // B
    BA: 'bs',
    BB: 'en',
    BD: 'bn',
    BE: 'nl',
    BF: 'fr',
    BG: 'bg',
    BH: 'ar',
    BI: 'fr',
    BJ: 'fr',
    BL: 'fr',
    BM: 'en',
    BN: 'ms',
    BO: 'es',
    BQ: 'nl',
    BR: 'pt',
    BS: 'en',
    BT: 'en',
    BV: 'no',
    BW: 'en',
    BY: 'be',
    BZ: 'en',
    // C
    CA: 'en',
    CC: 'en',
    CD: 'fr',
    CF: 'fr',
    CG: 'fr',
    CH: 'de',
    CI: 'fr',
    CK: 'en',
    CL: 'es',
    CM: 'fr',
    CN: 'zh-CN',
    CO: 'es',
    CR: 'es',
    CU: 'es',
    CV: 'pt',
    CW: 'nl',
    CX: 'en',
    CY: 'el',
    CZ: 'cs',
    // D
    DE: 'de',
    DJ: 'fr',
    DK: 'da',
    DM: 'en',
    DO: 'es',
    DZ: 'ar',
    // E
    EC: 'es',
    EE: 'et',
    EG: 'ar',
    EH: 'ar',
    ER: 'ti',
    ES: 'es',
    ET: 'am',
    // F
    FI: 'fi',
    FJ: 'en',
    FK: 'en',
    FM: 'en',
    FO: 'fo',
    FR: 'fr',
    // G
    GA: 'fr',
    GB: 'en',
    GD: 'en',
    GE: 'ka',
    GF: 'fr',
    GG: 'en',
    GH: 'en',
    GI: 'en',
    GL: 'da',
    GM: 'en',
    GN: 'fr',
    GP: 'fr',
    GQ: 'es',
    GR: 'el',
    GS: 'en',
    GT: 'es',
    GU: 'en',
    GW: 'pt',
    GY: 'en',
    // H
    HK: 'zh-TW',
    HM: 'en',
    HN: 'es',
    HR: 'hr',
    HT: 'ht',
    HU: 'hu',
    // I
    ID: 'id',
    IE: 'en',
    IL: 'iw',
    IM: 'en',
    IN: 'hi',
    IO: 'en',
    IQ: 'ar',
    IR: 'fa',
    IS: 'is',
    IT: 'it',
    // J
    JE: 'en',
    JM: 'en',
    JO: 'ar',
    JP: 'ja',
    // K
    KE: 'sw',
    KG: 'ky',
    KH: 'km',
    KI: 'en',
    KM: 'ar',
    KN: 'en',
    KP: 'ko',
    KR: 'ko',
    KW: 'ar',
    KY: 'en',
    KZ: 'kk',
    // L
    LA: 'lo',
    LB: 'ar',
    LC: 'en',
    LI: 'de',
    LK: 'si',
    LR: 'en',
    LS: 'en',
    LT: 'lt',
    LU: 'lb',
    LV: 'lv',
    LY: 'ar',
    // M
    MA: 'ar',
    MC: 'fr',
    MD: 'ro',
    ME: 'sr',
    MF: 'fr',
    MG: 'fr',
    MH: 'en',
    MK: 'mk',
    ML: 'fr',
    MM: 'my',
    MN: 'mn',
    MO: 'zh-TW',
    MP: 'en',
    MQ: 'fr',
    MR: 'ar',
    MS: 'en',
    MT: 'mt',
    MU: 'en',
    MV: 'en',
    MW: 'en',
    MX: 'es',
    MY: 'ms',
    MZ: 'pt',
    // N
    NA: 'en',
    NC: 'fr',
    NE: 'fr',
    NF: 'en',
    NG: 'en',
    NI: 'es',
    NL: 'nl',
    NO: 'no',
    NP: 'ne',
    NR: 'en',
    NU: 'en',
    NZ: 'en',
    // O
    OM: 'ar',
    // P
    PA: 'es',
    PE: 'es',
    PF: 'fr',
    PG: 'en',
    PH: 'tl',
    PK: 'ur',
    PL: 'pl',
    PM: 'fr',
    PN: 'en',
    PR: 'es',
    PS: 'ar',
    PT: 'pt',
    PW: 'en',
    PY: 'es',
    // Q
    QA: 'ar',
    // R
    RE: 'fr',
    RO: 'ro',
    RS: 'sr',
    RU: 'ru',
    RW: 'rw',
    // S
    SA: 'ar',
    SB: 'en',
    SC: 'en',
    SD: 'ar',
    SE: 'sv',
    SG: 'en',
    SH: 'en',
    SI: 'sl',
    SJ: 'no',
    SK: 'sk',
    SL: 'en',
    SM: 'it',
    SN: 'fr',
    SO: 'so',
    SR: 'nl',
    SS: 'en',
    ST: 'pt',
    SV: 'es',
    SX: 'nl',
    SY: 'ar',
    SZ: 'en',
    // T
    TC: 'en',
    TD: 'fr',
    TF: 'fr',
    TG: 'fr',
    TH: 'th',
    TJ: 'tg',
    TK: 'en',
    TL: 'pt',
    TM: 'tk',
    TN: 'ar',
    TO: 'en',
    TR: 'tr',
    TT: 'en',
    TV: 'en',
    TW: 'zh-TW',
    TZ: 'sw',
    // U
    UA: 'uk',
    UG: 'en',
    UM: 'en',
    US: 'en',
    UY: 'es',
    UZ: 'uz',
    // V
    VA: 'it',
    VC: 'en',
    VE: 'es',
    VG: 'en',
    VI: 'en',
    VN: 'vi',
    VU: 'en',
    // W
    WF: 'fr',
    WS: 'en',
    // X
    XK: 'sq',
    // Y
    YE: 'ar',
    YT: 'fr',
    // Z
    ZA: 'en',
    ZM: 'en',
    ZW: 'en'
};

const translateText = async (text: string, countryCode: string): Promise<string> => {
    const targetLang = countryToLanguage[countryCode.toUpperCase()] || 'en';

    if (targetLang === 'en') {
        return text;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    const cache = cached ? JSON.parse(cached) : {};
    const cacheKey = `en:${targetLang}:${text}`;

    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    try {
        const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
            params: {
                client: 'gtx',
                sl: 'en',
                tl: targetLang,
                dt: 't',
                q: text
            }
        });

        const data = response.data;

        const translatedText = data[0]
            ?.map((item: unknown[]) => item[0])
            .filter(Boolean)
            .join('');

        const result = translatedText || text;

        cache[cacheKey] = result;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

        return result;
    } catch {
        return text;
    }
};

export default translateText;
