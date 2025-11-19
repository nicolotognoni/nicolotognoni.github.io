import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            const isMobileScreen = window.innerWidth < MOBILE_BREAKPOINT;
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileUserAgent = /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(
                userAgent
            );

            // Check for touch capability as an additional signal, but primarily rely on screen width for layout
            // const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            setIsMobile(isMobileScreen || isMobileUserAgent);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    return isMobile;
}
