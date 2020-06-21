import { createContext, useState, useCallback } from "react";

export interface IAppConfigurationContext {
    appConfiguration: IAppConfiguration;
    setCurrentAppConfigurationContext: (currentAppConfiguration: IAppConfiguration) => void;
}

export interface IAppConfiguration {
    monitorConfig: IMonitorConfig;
}

export interface IMonitorConfig {
    inverterMode: string;
    inverterPort: string;
    isBatteryMonitor: boolean;
    batteryMonitorPort?: string;
    batteriesSeries?: number;
}

export const defaultAppConfig: IAppConfiguration = {
    monitorConfig: {
        inverterMode: 'M',
        inverterPort: 'none',
        isBatteryMonitor: false,
        batteryMonitorPort: 'none',
        batteriesSeries: 0
    }
}
export const defaultAppConfigurationContext: IAppConfigurationContext = {
    appConfiguration: defaultAppConfig,
    setCurrentAppConfigurationContext: () => {}
}
export const AppConfigurationContext = createContext<IAppConfigurationContext>(defaultAppConfigurationContext);

// Custom Hook
export const useAppConfigurationContext = (): IAppConfigurationContext => {
    const [appConfiguration, setAppConfiguration] = useState<IAppConfiguration>(defaultAppConfig);

    const setCurrentAppConfigurationContext = useCallback((currentAppConfigContext: IAppConfiguration): void => {
        setAppConfiguration(currentAppConfigContext);
        console.log('in store:', currentAppConfigContext);
    }, []);

    return {
        appConfiguration,
        setCurrentAppConfigurationContext
    }
}