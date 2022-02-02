import React, { Fragment } from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
        fontSize: 12,
        textAlign: 'center',
        
    },

    label: {
        width: "60%",
        borderRightWidth: 1
    },

    other: {
        width: '40%',
        borderRightWidth: 1,
    },

    last: {
        width: '40%',
    },
});

const TableRow = ({data}) => {

  const rows = data.map((item, index) => (
      
    <View style={styles.row} key={index}>
        <Text style={styles.other}>{item.ref}</Text>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.other}>{item.quantite}</Text>
        <Text style={styles.other}>{item.tarifLoc}</Text>
        <Text style={styles.last}>{item.quantite*item.tarifLoc}</Text>
    </View>
  ));
  return <Fragment>{rows}</Fragment>;
};

export default TableRow;