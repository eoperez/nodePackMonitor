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

export const getConfiguration = async () => {
    const results = await axios('http://192.168.0.5:5000/configuration');
    console.log('axios response:', results);
}

export const saveConfiguration = async (configuration: IAppConfiguration) => {
    const results = await axios.post('http://192.168.0.5:5000/configuration', configuration);
    console.log('axios save response', results);
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
        saveConfiguration(currentAppConfigContext);
        setAppConfiguration(currentAppConfigContext);
        console.log('in store:', currentAppConfigContext);
    }, []);

    return {
        appConfiguration,
        setCurrentAppConfigurationContext
    }
}