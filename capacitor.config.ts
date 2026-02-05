 import type { CapacitorConfig } from '@capacitor/cli';
 
 const config: CapacitorConfig = {
   appId: 'app.lovable.ccd4ec5a982246bf8f4fd405feb5d629',
   appName: 'LifeStack',
   webDir: 'dist',
   server: {
     url: 'https://ccd4ec5a-9822-46bf-8f4f-d405feb5d629.lovableproject.com?forceHideBadge=true',
     cleartext: true
   },
   ios: {
     contentInset: 'automatic',
     backgroundColor: '#0a0a0a',
     preferredContentMode: 'mobile',
     scheme: 'LifeStack'
   },
   plugins: {
     PushNotifications: {
       presentationOptions: ['badge', 'sound', 'alert']
     },
     SplashScreen: {
       launchShowDuration: 2000,
       backgroundColor: '#0a0a0a',
       showSpinner: false,
       androidScaleType: 'CENTER_CROP',
       splashFullScreen: true,
       splashImmersive: true
     }
   }
 };
 
 export default config;