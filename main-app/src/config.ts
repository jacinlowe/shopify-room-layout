

const featureFlags = {
  drawArcs: true,
  drawPolygon: true,
  showLineText: true,
  showSummaryWindow: true,
  eventLogging:false,
  debugMode: true,
  
} as const

export type TFeatureFlags = keyof typeof featureFlags;



class ConfigService {
    private static instance: ConfigService;
    private featureFlags: Record<string, boolean>;
  
    private constructor() {
      // Initialize feature flags (you can load from an API or any other source)
      this.featureFlags = {
        ...featureFlags
      };
    }
  
    static getInstance(): ConfigService {
      if (!ConfigService.instance) {
        ConfigService.instance = new ConfigService();
      }
      return ConfigService.instance;
    }
  
    getFeatureFlag(feature: TFeatureFlags): boolean {
      return this.featureFlags[feature] || false;
    }

    toggleFeatureFlag(feature: TFeatureFlags) {
      const featureFlag = this.featureFlags[feature];
      this.featureFlags[feature] =!featureFlag;
      return featureFlag;
    }
  }
  
  export const configService = ConfigService.getInstance();