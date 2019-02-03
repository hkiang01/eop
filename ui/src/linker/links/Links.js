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

import * as apiConfig from "../../../config/api.json";
import { Entity } from "../entities/Entities";
import { Property } from "../properties/Properties";

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

function Link(entityId, propertyId) {
  this.entityId = entityId;
  this.propertyId = propertyId;
}

/**
 * The baseUrl for API requests
 */
const endpoint = apiConfig.dev.endpoint;

/**
 * Gets Links from the database
 */
const getLinks = async () => {
  const response = await fetch(endpoint + "/link");
  const body = await response.json();
  console.debug("getLinks response", response);
  if (response.status !== 200) throw Error(body.message);
  return body;
};

class Links extends React.Component {
  /**
   * Used to store
   * - the selected Link
   * - the query used to filter the list of Links
   * - the Links from the API
   * - whether the user can click the 'Add' button
   */
  state = {
    selectedLink: null,
    query: null,
    links: [],
    canAddNewLink: this.canAddNewLink()
  };

  /**
   * Gets the entiites from the database,
   */
  componentDidMount() {
    getLinks()
      .then(res => {
        this.setState({ links: res }, () => {
          console.debug("componentDidMount state", this.state);
        });
      })
      .catch(err => console.error(err));
  }

  /**
   * A new Link can be added if there exists no Link
   * in links whose entityId and propertyId match the
   * selectedEntity's id and selectedProperty's id, respectively
   */
  canAddNewLink() {
    const selectedEntity = this.props.selectedEntity;
    const selectedProperty = this.props.selectedProperty;
    return (
      selectedEntity &&
      selectedProperty &&
      !this.state.links.find(
        link =>
          link.entityId === selectedEntity.id &&
          link.propertyId === selectedProperty.id
      )
    );
  }

  render() {
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
            disabled={!this.state.canAddNewLink}
            onClick={this.handleAdd}
          >
            Create Link
          </Button>
        </Grid>
        <Grid container spacing={16}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Entity</TableCell>
                <TableCell>Property</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.links.map(link => (
                <TableRow key={link.entityId + link.propertyId}>
                  <TableCell>{link.entityId}</TableCell>
                  <TableCell>{link.propertyId}</TableCell>
                </TableRow>
              ))}
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
