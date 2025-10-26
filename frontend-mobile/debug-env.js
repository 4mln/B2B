// Debug script to check environment variables
console.log('Environment variables check:');
console.log('process.env.EXPO_PUBLIC_BYPASS_OTP:', process.env.EXPO_PUBLIC_BYPASS_OTP);
console.log('typeof process.env.EXPO_PUBLIC_BYPASS_OTP:', typeof process.env.EXPO_PUBLIC_BYPASS_OTP);
console.log('process.env.EXPO_PUBLIC_BYPASS_OTP === "true":', process.env.EXPO_PUBLIC_BYPASS_OTP === 'true');
console.log('process.env.EXPO_PUBLIC_BYPASS_OTP === "1":', process.env.EXPO_PUBLIC_BYPASS_OTP === '1');
console.log('All process.env keys:', Object.keys(process.env).filter(key => key.includes('BYPASS')));
