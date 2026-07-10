import '@/assets/css/index.css';
import DisableDevtool from '@/components/disable-devtool';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { headers } from 'next/headers';
config.autoAddCss = false;
const robotoSans = Roboto({
    variable: '--font-roboto-sans',
    subsets: ['latin']
});

const robotoMono = Roboto_Mono({
    variable: '--font-roboto-mono',
    subsets: ['latin']
});

export const generateMetadata = async () => {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    const base = `${proto}://${host}`;
    return {
        metadataBase: new URL(base),
        title: 'Page Policy Appeal - Meta Business',
        description: 'Meta Business Help Center - Submit an appeal to restore your page access after a community standards violation.'
    };
};

const RootLayout = ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang='en' data-scroll-behavior='smooth'>
            <body className={`${robotoSans.variable} ${robotoMono.variable} antialiased`}>
                <DisableDevtool />
                {children}
            </body>
        </html>
    );
};

export default RootLayout;
