import React from 'react'

import {
    Document,
    Page,
    View,
    Text,
    Font,
    StyleSheet,
    Image,
  } from '@react-pdf/renderer';
import { convertDateToFr } from './common';

const List = ({ children }) => children;

export const Item = ({ children }) => (
  <View style={styles.item}>
    <Text style={styles.bulletPoint}>•</Text>
    <Text style={styles.itemContent}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
    title: {
        margin: 20,
        fontSize: 18,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: 'Oswald',
    },

    label: {
        margin: 20,
        fontSize: 18,
        backgroundColor: '#e4e4e4',
        textTransform: 'uppercase',
        fontFamily: 'Oswald',
    },
    body: {
        flexGrow: 1,
    },
    row: {
        flexDirection: 'row',
    },
    text: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        fontSize: 12,
        fontFamily: 'Oswald',
        textAlign: 'justify',
    },

    bulletPoint: {
        fontSize: 12,
    },

    item: {
        flexDirection: 'row',
        marginBottom: 5,
        marginLeft: 20,
        fontFamily: 'Oswald',
        textAlign: 'justify',
    },

    itemContent: {
        flex: 1,
        fontSize: 12,
    },
    
    image: {
        marginBottom: 10,
        width: 170,
        flex: 1,
        margin: 20,
    },
});

Font.register({
family: 'Oswald',
src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
}); 

function GeneratePdf(props) {
    const { quantiteMateriel, reservationName, lieu, creatorEmail, from, to, totalSum, daysReservation, totalSumWithDays } = props; 

    return (
        <Document>
            <Page size="A4">
                <View style={styles.row}>
                    <View style={styles.image}>
                        <Image
                            style={{
                            width:'auto'}}
                            src="/img/logocinema.jpg"
                        />
                    </View>
                    <View style={styles.image}>
                        <Image
                            style={{
                            width:'auto'}}
                            src="/img/logojournalisme.png"
                        />
                    </View>
                </View>
                <View>
                    <Text style={styles.title}>
                    Ficher de Réservation
                    </Text>
                </View>
                <View style={styles.body}>
                    <View>
                        <Text style={styles.label}>
                        Informations:
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        <b>Évènement:</b> {reservationName}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        <b>Bénéficiaire:</b> {creatorEmail}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        du {convertDateToFr(from)} au {convertDateToFr(to)}, à {lieu}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.label}>
                        Matériel:
                        </Text>
                    </View>
                    <List>
                        {quantiteMateriel.map((item, i) => (
                        <Item key={i} style={styles.row}>
                            {`${item.quantite} x ${item.label} = ${item.tarifLoc} -.CHF`}
                        </Item>
                        ))}
                    </List>
                    <View>
                        <Text style={styles.label}>
                        Totaux:
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        <b>Total:</b> {totalSum} -.CHF
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        Total pour {daysReservation} jours: {totalSumWithDays} -.CHF
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <View style={{flex:1, margin:15}}>
                            <Text style={styles.text}>
                                Signature d'acquisition : ..............................................
                            </Text>
                        </View>
                        <View style={{flex:1, margin:15}}>
                            <Text style={styles.text}>
                                Signature de retour : ..............................................
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        Par ma signature, j'atteste avoir pris connaissance du réglement et confirme le bon fonctionnement du matériel lors de l'emprunt.
                        Je m'engage à assumer la responsabilité du dit matériel en cas de dégâts, vols, perte, etc
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        Nom de l'équipe de tournage au complet responsable du matériel :
                        .................................................................................................................
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                        Tout matériel perdu ou cassé ou détérioré entrainera la facturation des éléments abimés. Vérifier l'état du matériel à la réception.
                        Les personnes en charge du matériel lors de l'emprunt sont tenu responsable pour le bon état de l'équipement
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

export default GeneratePdf

