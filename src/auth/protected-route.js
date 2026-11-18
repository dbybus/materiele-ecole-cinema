import React from "react";
import { Route } from "react-router-dom";
import { withAuthenticationRequired } from './index';
import Loading  from "../components/loading";

const ProtectedRoute = ({ component, ...args }) => (
  <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: () => <Loading />,
    })}
    {...args}
  />
);

export default ProtectedRoute;