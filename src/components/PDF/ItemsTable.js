import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TableRow from "./TableRow";
import TableHeader from  "./TableHeader";
const styles = StyleSheet.create({
    tableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: 24,
        borderWidth: 1,
    },
});

const ItemsTable = ({data}) => (
    
  <View style={styles.tableContainer}>
    <TableHeader />
    <TableRow data={data} />
    {/*<TableFooter items={data.items} />*/}
  </View>
);

export default ItemsTable;