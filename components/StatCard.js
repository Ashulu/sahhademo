// components/StatCard.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// A mapping for colors to make the 'state' look nice
const stateColors = {
  high: '#4CAF50', // green
  medium: '#FFC107', // amber
  low: '#F44336', // red
  default: '#607D8B', // blue grey
};

const StatCard = ({ item }) => {
  // item is one of the objects from the Sahha analysis array
  const { type, state, score, dataSources } = item;

  // Capitalize the first letter of the type (e.g., 'sleep' -> 'Sleep')
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  const formattedScore = `${score}/1`;
  const formattedDataSources = dataSources.join(', ');
  const stateColor = stateColors[state.toLowerCase()] || stateColors.default;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.typeText}>{formattedType}</Text>
        <Text style={[styles.stateText, { backgroundColor: stateColor }]}>{state}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.scoreText}>{formattedScore}</Text>
        <Text style={styles.dataSourceText}>Sources: {formattedDataSources}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  stateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden', // Ensures the background respects the borderRadius
    textTransform: 'uppercase',
  },
  body: {
    alignItems: 'flex-start',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '200',
    color: '#007bff',
    marginBottom: 8,
  },
  dataSourceText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default StatCard;