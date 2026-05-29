import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import Dashboard from './pages/Dashboard';
import EcoMap from './pages/EcoMap';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportChat from './pages/ReportChat';
import ReportCreate from './pages/ReportCreate';
import ReportDetail from './pages/ReportDetail';
import ProtectedRoute from './routes/ProtectedRoute';
import AppMenu from './shared/AppMenu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.scss';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <ReportsProvider>
          <IonSplitPane contentId="main-content">
            <AppMenu />
            <IonRouterOutlet id="main-content">
              <Route exact path="/login">
                <Login />
              </Route>
              <Route exact path="/register">
                <Register />
              </Route>
              <ProtectedRoute exact path="/app/dashboard" component={Dashboard} />
              <ProtectedRoute exact path="/app/eco-map" component={EcoMap} />
              <ProtectedRoute exact path="/app/reports/new" component={ReportCreate} />
              <ProtectedRoute exact path="/app/report/:reportId" component={ReportDetail} />
              <ProtectedRoute
                exact
                path="/app/report/:reportId/chat"
                component={ReportChat}
              />
              <Route exact path="/">
                <Redirect to="/app/dashboard" />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        </ReportsProvider>
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
