import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to Ron&apos;s Care Hub</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.cream,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
});
