import { createContext, useState, useCallback } from "react";
import axios, { AxiosInstance } from "axios";

// Interfaces
export interface IAppConfigurationContext {
    appConfiguration: IAppConfiguration;
    setCurrentAppConfigurationContext: (currentAppConfiguration: IAppConfiguration) => void;
}

export interface IAppConfiguration {
    monitorConfig: IMonitorConfig;
    systemConfig: ISystemConfig;
}

export interface IMonitorConfig {
    inverterPort: string;
    isBatteryMonitor: boolean;
    batteryMonitorPort?: string;
}
export interface ISystemConfig {
    inverterMode: string;
    inverterPower: number;
    pvModulesPower?: number;
    batteriesSeries?: number;
}

export const api: AxiosInstance = axios.create({
    baseURL: `http://192.168.0.5:5000/configuration/`
});

export const getConfiguration = async () => {
    api.get('/').then((response) => {
        console.log(response.data);
    });
}

export const defaultAppConfig: IAppConfiguration = {
    monitorConfig: {
        inverterPort: 'none',
        isBatteryMonitor: false,
        batteryMonitorPort: 'none'
    },
    systemConfig: {
        inverterMode: 'M',
        inverterPower: 5000,
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
        getConfiguration();
        setAppConfiguration(currentAppConfigContext);
        console.log('in store:', currentAppConfigContext);
    }, []);

    return {
        appConfiguration,
        setCurrentAppConfigurationContext
    }
}