import { Redirect } from 'expo-router';

export default function Index() {
  // Always render the main tabs; LoginWall will overlay/gate access
  return <Redirect href="/(tabs)" />;
}


