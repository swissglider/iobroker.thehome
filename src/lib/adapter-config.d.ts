// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			option1: boolean;
			option2: string;
			ConfigChangeListener_active: boolean;
			startConfigChangeListener: boolean;
			InfluxDBHandlerAdapter_token: string;
			InfluxDBHandlerAdapter_bucketTransformed: string;
			InfluxDBHandlerAdapter_bucketLabels: string;
			InfluxDBHandlerAdapter_labels: { name: string; color?: string; description?: string }[];
			InfluxDBHandlerAdapter_active: boolean;
			BatteryChecker_active: boolean;
			BatteryChecker_timerMS: number;
			BatteryChecker_roles: string[];
			BatteryChecker_lowBatPercent_alert: number;
			BatteryChecker_lowBatPercent_warning: number;
			BatteryChecker_bucket: string;
			ConnectionChecker_disabled: boolean;
			ConnectionChecker_timerMS: number;
			MiNameAdapter_login: string;
			MiNameAdapter_password: string;
			MiNameAdapter_defaultCountry: string;
			MiNameAdapter_deviceTypeFunctionMappings: Record<string, Record<string, Record<string, any>>>;
			NetatmoAdapter_deviceTypeFunctionMappings: Record<string, Record<string, Record<string, any>>>;
			HMIPAdapter_deviceTypeFunctionMappings: Record<string, Record<string, Record<string, any>>>;
			ShellyAdapter_deviceTypeFunctionMappings: Record<string, Record<string, Record<string, any>>>;
			SonoffAdapter_deviceTypeFunctionMappings: Record<string, Record<string, Record<string, any>>>;
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
// eslint-disable-next-line prettier/prettier
export { };
