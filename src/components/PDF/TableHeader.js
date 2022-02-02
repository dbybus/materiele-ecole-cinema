import React from 'react';
import {Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        textAlign: 'center',
        fontStyle: 'bold',
        flexGrow: 1,
        fontSize: 12,
    },

    name: {
        width: '60%',
        borderRightWidth: 1,
    },

    other: {
        width: '40%',
        borderRightWidth: 1,
    },
    
    amount: {
        width: '40%'
    },
  });

  const TableHeader = () => (
    <View style={styles.container}>
        <Text style={styles.other}>Reference</Text>
        <Text style={styles.name}>Nom</Text>
        <Text style={styles.other}>Quantite</Text>
        <Text style={styles.other}>Prix location</Text>
        <Text style={styles.amount}>TOTAL (location par objet) </Text>
    </View>
  );
  
  export default TableHeader