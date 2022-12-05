import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";
import Historic from "./Historic";
import List from "./List";
import ListeDemandeModif from "./ListeDemandeModif";
import View from "./View/View";

export default function Index() {
  useDocumentTitle("Plan de transport");
  return (
    <Switch>
      <SentryRoute path="/ligne-de-bus/historique" component={Historic} />
      <SentryRoute path="/ligne-de-bus/demande-de-modification" component={() => <ListeDemandeModif />} />
      <SentryRoute path="/ligne-de-bus/:id" component={() => <View />} />
      <SentryRoute path="/ligne-de-bus" component={() => <List />} />
    </Switch>
  );
}