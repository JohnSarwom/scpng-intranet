import React, { createContext, useContext, useState, useEffect } from 'react';

interface SlideshowContextType {
    isSlideshowVisible: boolean;
    toggleSlideshow: () => void;
    isNewsTickerVisible: boolean;
    toggleNewsTicker: () => void;
    isTradingViewVisible: boolean;
    toggleTradingView: () => void;
}

const SlideshowContext = createContext<SlideshowContextType | undefined>(undefined);

export const SlideshowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSlideshowVisible, setIsSlideshowVisible] = useState(true);
    const [isNewsTickerVisible, setIsNewsTickerVisible] = useState(true);
    const [isTradingViewVisible, setIsTradingViewVisible] = useState(true);

    useEffect(() => {
        const savedSlideshow = localStorage.getItem('slideshowVisible');
        if (savedSlideshow !== null) {
            setIsSlideshowVisible(JSON.parse(savedSlideshow));
        }

        const savedNewsTicker = localStorage.getItem('newsTickerVisible');
        if (savedNewsTicker !== null) {
            setIsNewsTickerVisible(JSON.parse(savedNewsTicker));
        }

        const savedTradingView = localStorage.getItem('tradingViewVisible');
        if (savedTradingView !== null) {
            setIsTradingViewVisible(JSON.parse(savedTradingView));
        }
    }, []);

    const toggleSlideshow = () => {
        setIsSlideshowVisible((prev) => {
            const newValue = !prev;
            localStorage.setItem('slideshowVisible', JSON.stringify(newValue));
            return newValue;
        });
    };

    const toggleNewsTicker = () => {
        setIsNewsTickerVisible((prev) => {
            const newValue = !prev;
            localStorage.setItem('newsTickerVisible', JSON.stringify(newValue));
            return newValue;
        });
    };

    const toggleTradingView = () => {
        setIsTradingViewVisible((prev) => {
            const newValue = !prev;
            localStorage.setItem('tradingViewVisible', JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <SlideshowContext.Provider value={{
            isSlideshowVisible,
            toggleSlideshow,
            isNewsTickerVisible,
            toggleNewsTicker,
            isTradingViewVisible,
            toggleTradingView
        }}>
            {children}
        </SlideshowContext.Provider>
    );
};

export const useSlideshow = () => {
    const context = useContext(SlideshowContext);
    if (context === undefined) {
        throw new Error('useSlideshow must be used within a SlideshowProvider');
    }
    return context;
};
