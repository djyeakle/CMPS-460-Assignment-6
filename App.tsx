import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Post {
  id: number;
  name: string;
  description: string;
  price: string;
  region: string;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://tea-api-gules.vercel.app/api");
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const data: Post[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected API Response");
      }
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>API Post Viewer</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={() => void fetchPosts()} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.name}</Text>
              <Text>{item.description}</Text>
              <Text>{item.price}</Text>
              <Text>{item.region}</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={() => void fetchPosts(true)}
          ListEmptyComponent={<Text>No Posts Available</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f5f7fa",
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 7,
  },
  error: {
    color: "#a51b1b",
    marginBottom: 12,
  },
});
