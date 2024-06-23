import React from "react";
import './App.css';
import { Route, Routes } from "react-router-dom";
import Four0Four from './components/404';
import { routes } from './utils/utils';
import AuthGuard from './components/AuthGuard';
import PermissionGuard from './components/PermissionGuard';
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/saga-green/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <div className="App">
      <PrimeReactProvider>
        <AuthGuard>
          <PermissionGuard>
            <Routes>
              {
                routes?.map((route, index) => <Route key={`route-${index}`} path={ route.path } element={ route.element } />)
              }
              <Route path="*" element={ <Four0Four /> } />
            </Routes>
          </PermissionGuard>
        </AuthGuard>
      </PrimeReactProvider>
    </div>
  );
}

export default App;
