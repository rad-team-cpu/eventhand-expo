module.exports = {
  expo: {
    name: "eventhand-expo",
    slug: "eventhand-expo",
    version: "1.0.0",
    owner: "rad-team-cpu",
    icon: "./src/assets/images/applogo.png",
    splash: {
      image: "./src/assets/images/applogo.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "ee54611b-fe17-45a3-ab1e-5fc4cc3ac9cf",
      },
    },
  },
  android: {
    package: "com.eventhandexpo",
  },
  assetBundlePatterns: ["**/*"],
};
