import { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

// Interfaces
export interface IAppConfigurationContext {
    appConfiguration: IAppConfiguration;
    setCurrentAppConfigurationContext: (currentAppConfiguration: IAppConfiguration) => void;
}

export interface IAppConfiguration {
    monitorConfig: IMonitorConfig;
    systemConfig: ISystemConfig;
    integrationConfig: IIntegrationConfiguration;
}

export interface IIntegrationConfiguration {
    isPublicEnabled: boolean;
    subdomain?: string;
    influxHost?: string;
    influxUser?: string;
    influxPassword?: string;
    influxDb?: string;
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
export const defaultAppConfig: IAppConfiguration = {
    monitorConfig: {
        inverterPort: 'none',
        isBatteryMonitor: false,
        batteryMonitorPort: 'none'
    },
    systemConfig: {
        inverterMode: 'M',
        inverterPower: 5000,
        pvModulesPower: 5000,
        batteriesSeries: 0
    },
    integrationConfig: {
        isPublicEnabled: false
    }
}
export const defaultAppConfigurationContext: IAppConfigurationContext = {
    appConfiguration: defaultAppConfig,
    setCurrentAppConfigurationContext: () => {}
}

export const getSocketServerEndPoint = () => {
    const requestLocation = window.location.href;
    if( requestLocation === 'http://localhost:3000/'){
      return 'http://192.168.0.5:5000/'
    } else {
      // Remove trailing /
      return requestLocation
    }
}

export const ENDPOINT: string = getSocketServerEndPoint();

export const AppConfigurationContext = createContext<IAppConfigurationContext>(defaultAppConfigurationContext);

// Custom Hook
export const useAppConfigurationContext = (): IAppConfigurationContext => {
    const [appConfiguration, setAppConfiguration] = useState<IAppConfiguration>(defaultAppConfig);
    
    useEffect(() => {
        const getConfiguration = async () => {
            const results = await axios(`${ENDPOINT}configuration`);
            if (typeof results.data.inverterPort !== 'undefined') {
                const AppConfigFromServer: IAppConfiguration = {
                    monitorConfig: {
                        inverterPort: results.data.inverterPort,
                        isBatteryMonitor: !!results.data.isBatteryMonitor,
                        batteryMonitorPort: results.data.batteryMonitorPort,
                    },
                    systemConfig: {
                        inverterMode: results.data.inverterMode,
                        inverterPower: results.data.inverterPower,
                        pvModulesPower: results.data.pvModulesPower,
                        batteriesSeries: results.data.batteriesSeries
                    },
                    integrationConfig: {
                        isPublicEnabled: !!results.data.isPublicEnabled
                    }
                };
                 // add optional configuration only if attribute exists
                if(results.data.subdomain){
                    AppConfigFromServer.integrationConfig.subdomain = results.data.subdomain;
                }
                if(results.data.influxHost){
                    AppConfigFromServer.integrationConfig.influxHost = results.data.influxHost;
                }
                if(results.data.influxUser){
                    AppConfigFromServer.integrationConfig.influxUser = results.data.influxUser;
                }
                if(results.data.influxPassword){
                    AppConfigFromServer.integrationConfig.influxPassword = results.data.influxPassword;
                }
                if(results.data.influxDb){
                    AppConfigFromServer.integrationConfig.influxDb = results.data.influxDb;
                }
                
                setAppConfiguration(AppConfigFromServer);
            }
        }
        getConfiguration();
    }, []);

    const saveConfiguration = async (configuration: IAppConfiguration) => {
        // Save if current and old configuration are different.
        if(configuration !== appConfiguration){
            const results = await axios.post(`${ENDPOINT}configuration`, configuration);
            if(!(results.status === 200)){
                console.error('Error saving configuration:',results.data);
            }
        }
    }

    const setCurrentAppConfigurationContext = useCallback((currentAppConfigContext: IAppConfiguration): void => {
        setAppConfiguration(currentAppConfigContext);
        saveConfiguration(currentAppConfigContext);    
    }, []);

    return {
        appConfiguration,
        setCurrentAppConfigurationContext
    }
}