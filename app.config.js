module.exports = {
    name: 'eventhand-expo',
    slug: 'eventhand-expo',
    version: '1.0.0',
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    expo:{
      extra:{
        eas:{
          projectId: "ee4933df-9117-4662-aefb-c9d9ef7c4ffb"
        }
      }
    },
    android: {
      package: 'com.eventhandexpo',
    },
  };