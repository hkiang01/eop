import React from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Radio from "@material-ui/core/Radio";

import * as apiConfig from "../../config/api.json";
import { Entity } from "./Entities";
import { Property } from "./Properties";

/**
 * Styles named after their respective components.
 * For example, typography is for the <Typography /> component
 */
const styles = theme => ({
  root: {
    width: "100%",
    padding: theme.spacing.unit * 2,
    dense: true
  },
  typography: {
    marginLeft: 10,
    marginBottom: 20
  },
  paper: {
    padding: theme.spacing.unit * 2
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  table: {
    minWidth: 700
  }
});

/**
 * Mimics the named_link table
 */
class NamedLink {
  constructor(id, entityId, entityName, propertyId, propertyName) {
    this.id = id;
    this.entityId = entityId;
    this.entityName = entityName;
    this.propertyId = propertyId;
    this.propertyName = propertyName;
  }
}

/**
 * The baseUrl for API requests
 */
const endpoint = apiConfig.dev.endpoint;

/**
 * Gets named_link records from the database
 */
let getNamedLinks = async () => {
  const response = await fetch(endpoint + "/named_link");
  const body = await response.json();
  console.debug("getLinks response", response);
  if (response.status !== 200) throw Error(body.message);

  const result = Promise.resolve(body);
  return result.then(function(records) {
    console.debug("getNamedLinks records", records);
    return records.map(
    record => new NamedLink(record.id, record.entity_id, record.entity_name, record.property_id, record.property_name)
  )});
};

/**
 * Adds aa link to the database by entityId and propertyId
 */
const addLink = async (entityId, propertyId) => {
  const data = JSON.stringify({ entityId: entityId, propertyId: propertyId });
  const response = await fetch(endpoint + "/link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: data
  });
  const body = await response.json();
  console.debug("addLink response", response);
  if (response.status !== 200) throw Error(body.message);
  return body;
};

class Links extends React.Component {
  /**
   * Used to store
   * - the selected NamedLink
   * - the query used to filter the list of NamedLinks
   * - the NamedLinks
   * - whether the user can click the 'Add' button
   */
  state = {
    selectedNamedLink: null,
    query: null,
    namedLinks: [],
    canAddNewLink: this.canAddNewLink()
  };

  /**
   * Gets the named_link records from the database,
   * transforms them into NamedLink instances,
   * and populates the state
   */
  componentDidMount() {
    getNamedLinks()
      .then(namedLinks => {
        console.debug("componentDidMount namedLinks", namedLinks);
        this.setState({ namedLinks: namedLinks }, () => {
          console.debug("componentDidMount state", this.state);
        });
      });
  }
  /**
   * Adds new link to database based on the selected entity and property.
   * Note that the view from which getNamedLinks() pulls from won't be updated yet.
   * To compensate, this method creates a new NamedLink based on the information that would appear in the named_link view once updated 
   * minus the id, which is generated by the databse itself)
   * This way, the user doesn't have to refresh the page in order to see the newly-added link in the "Links" list
   */
  handleAdd = event => {
    addLink(this.props.selectedEntity.id, this.props.selectedProperty.id).then(
        this.setState((prevState, props) => {
          let namedLinks = prevState.namedLinks;
          const newNamedLink = new NamedLink("", this.props.selectedEntity.id, this.props.selectedEntity.name,this.props.selectedProperty.id, this.props.selectedProperty.name);
          namedLinks.push(newNamedLink);
          return { namedLinks: namedLinks }}, () => {
          console.debug("handleAdd state", this.state);
        }));
  }

  /**
   * Toggles the selection of a NamedLink
   * If the NamedLink is already selected,
   */
  handleSelection = selection => {
    const selectionId = selection.currentTarget.value;
    const selectedNamedLink = this.state.namedLinks.find(namedLink => namedLink.id === selectionId);
    this.setState({ selectedNamedLink: selectedNamedLink }, () => {
      console.debug("handleSelection state", this.state);
    });
  }

  /**
   * A new NamedLink can be added if there exists no NamedLink
   * in namedLinks whose entityId and propertyId match the
   * selectedEntity's id and selectedProperty's id, respectively
   */
  canAddNewLink() {
    const selectedEntity = this.props.selectedEntity;
    const selectedProperty = this.props.selectedProperty;
    return (
      selectedEntity &&
      selectedProperty &&
      !this.state.namedLinks.find(
        namedLink =>
        namedLink.entityId === selectedEntity.id &&
        namedLink.propertyId === selectedProperty.id
      )
    );
  }

  /**
   * Whether the selected Entity or Property references the Link.
   * This is helpful in informing the user what Entities and Properties
   * are linked to a given Link
   */
  isLinkReferencedBySelectedEntityOrProperty = namedLink => {
    const referencedBySelectedEntity = this.props.selectedEntity
      ? namedLink.entityId === this.props.selectedEntity.id
      : false;
    const referencedBySelectedProperty = this.props.selectedProperty
      ? namedLink.propertyId === this.props.selectedProperty.id
      : false;
    return referencedBySelectedEntity || referencedBySelectedProperty;
  };

  /**
   * Generates a NamedLink list item with:
   * - A radio button
   * - the relevant Entity name
   * - the relevant Property name
   * - a delete icon
   *
   * Also adds handlers which enable:
   * - Selecting an link
   * - Deleting an link
   *
   * Finally, the NamedLink is visible only if:
   * - the search box is empty, or
   * - the search box's query value is contained within either:
   *   - the NamedLink's coressponding Entity name
   *   - the NamedLink's coressponding Property name
   */
  generateLinkTableRow(namedLink) {
    return (
      <TableRow
        key={namedLink.entityId + namedLink.propertyId}
        selected={this.isLinkReferencedBySelectedEntityOrProperty(namedLink)}
      >
        <TableCell>
          <Radio
            checked={this.state.selectedNamedLink === namedLink}
            onChange={this.handleSelection}
            value={namedLink.id}
          />
        </TableCell>
        {/* // TODO: change IDs below to corresponding names */}
        <TableCell>{namedLink.entityName}</TableCell>
        <TableCell>{namedLink.propertyName}</TableCell>
      </TableRow>
    );
  }

  /**
   * A "Links" component is titled with the word "Links".
   * Below that, a search bar and a button to "Add Link" is present.
   * Finally, a table is shown listing the links present in state.
   */
  render() {
    console.debug("Links props", this.props);
    const { classes } = this.props;
    return (
      <Paper className={classes.paper}>
        <Typography
          className={classes.typography}
          variant="h4"
          gutterBottom
          align="left"
        >
          Links
        </Typography>
        <Grid container spacing={16}>
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
          <InputBase
            id="link-query"
            className={classes.input}
            placeholder="Search Links"
            onChange={this.handleSearch}
          />
          <Button
            variant="contained"
            color="secondary"
            disabled={!this.canAddNewLink()}
            onClick={this.handleAdd}
          >
            Add Link
          </Button>
        </Grid>
        <Grid container spacing={16}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Entity</TableCell>
                <TableCell>Property</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.namedLinks.map(namedLink => this.generateLinkTableRow(namedLink))}
            </TableBody>
          </Table>
        </Grid>
      </Paper>
    );
  }
}

Links.propTypes = {
  selectedEntity: PropTypes.instanceOf(Entity),
  selectedProperty: PropTypes.instanceOf(Property)
};

export default withStyles(styles)(Links);