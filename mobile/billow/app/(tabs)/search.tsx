import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import SearchUsers from '@/components/friends/SearchUsers';

export default function Search() {
  return (
    <SafeAreaView style={styles.container}>
      <SearchUsers />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});