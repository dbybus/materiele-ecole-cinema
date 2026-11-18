import React, { forwardRef } from 'react';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

// Shared material-table setup. Every table in the app used to copy-paste this icon block;
// import it from here instead.

const icon = (Component) => forwardRef((props, ref) => <Component {...props} ref={ref} />);

export const tableIcons = {
  Add: icon(AddBox),
  Check: icon(Check),
  Clear: icon(Clear),
  Delete: icon(DeleteOutline),
  DetailPanel: icon(ChevronRight),
  Edit: icon(Edit),
  Export: icon(SaveAlt),
  Filter: icon(FilterList),
  FirstPage: icon(FirstPage),
  LastPage: icon(LastPage),
  NextPage: icon(ChevronRight),
  PreviousPage: icon(ChevronLeft),
  ResetSearch: icon(Clear),
  Search: icon(Search),
  SortArrow: icon(ArrowDownward),
  ThirdStateCheck: icon(Remove),
  ViewColumn: icon(ViewColumn),
};

// French texts for material-table's built-in labels
export const localizationFr = {
  body: {
    emptyDataSourceMessage: 'Aucun élément à afficher',
    addTooltip: 'Ajouter',
    deleteTooltip: 'Supprimer',
    editTooltip: 'Modifier',
    editRow: {
      deleteText: 'Supprimer cette ligne ?',
      cancelTooltip: 'Annuler',
      saveTooltip: 'Enregistrer',
    },
  },
  header: { actions: 'Actions' },
  pagination: {
    labelDisplayedRows: '{from}-{to} sur {count}',
    labelRowsSelect: 'lignes',
    labelRowsPerPage: 'Lignes par page :',
    firstTooltip: 'Première page',
    previousTooltip: 'Page précédente',
    nextTooltip: 'Page suivante',
    lastTooltip: 'Dernière page',
  },
  toolbar: {
    searchTooltip: 'Rechercher',
    searchPlaceholder: 'Rechercher',
  },
};

// Currency columns: "1 250 CHF"
export const chfCurrencySetting = { locale: 'fr-CH', currencyCode: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 2 };
