import React from "react";
import {
  CssBaseline,
  makeStyles,
  createStyles,
  Theme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import EbookViewer from "./components/EbookViewer";
import Plugins from "./components/Plugins";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import { useDispatch, useSelector } from "react-redux";
import { setNavigationOpen } from "./reducers/uiReducer";
import { RootState } from "./rootReducer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
    },
  }),
);

const App: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigationOpen = useSelector((s: RootState) => s.ui.navigationOpen)

  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar color="transparent" position="fixed" variant="outlined">
          <Toolbar variant="dense">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onNavigationToggle}
              className={classes.menuButton}
              size="small"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Responsive drawer
            </Typography>
          </Toolbar>
        </AppBar>
        <NavigationMenu />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/">
              <EbookViewer />
            </Route>
            <Route path="/plugins">
              <Plugins />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;
