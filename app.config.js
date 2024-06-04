module.exports = {
    name: 'eventhand-expo',
    slug: 'eventhand-expo',
    version: '1.0.0',
    expo:{
      plugins: [
        [
          "expo-image-picker",
          {
            "photosPermission": "The app accesses your photos to let you share them with your friends."
          }
        ],
      ],
      extra:{
        eas:{
          projectId: "ee4933df-9117-4662-aefb-c9d9ef7c4ffb"
        }
      }
    },
    android: {
      package: 'com.eventhandexpo',
    },
    assetBundlePatterns: [
      "**/*"
    ],
  };