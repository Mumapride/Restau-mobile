import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '../../components';
import { COLORS, SPACING } from '../../theme/tokens';

const StudentsScreen = () => {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="people-outline"
        title="Students"
        message="Student management is not available yet."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
});

export default StudentsScreen;
