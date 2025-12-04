const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = ({ config }) => {
  // Plugin inline para adicionar cleartext traffic
  const withCleartextTraffic = (config) => {
    return withAndroidManifest(config, (config) => {
      const androidManifest = config.modResults;
      const mainApplication = androidManifest.manifest.application[0];
      
      // Adiciona usesCleartextTraffic
      mainApplication.$['android:usesCleartextTraffic'] = 'true';
      
      return config;
    });
  };

  // Configuração base
  const baseConfig = {
    ...config,
    name: "mobile-frontend",
    slug: "mobile-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobilefrontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.mobilefrontend"
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-secure-store",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "a1ede591-7a31-41d6-bd22-fa10196b5d0d"
      }
    }
  };

  // Aplica o plugin
  return withCleartextTraffic(baseConfig);
};