

const featureFlags: Record<string, boolean> = {
  drawArcs: false,
  drawPolygon: true,
  showLineText: true,
  showSummaryWindow: true,
  eventLogging:false,
  
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
  }
  
  export const configService = ConfigService.getInstance();