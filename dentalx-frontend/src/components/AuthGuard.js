import React from "react";
import { login, logoff } from "../redux/actions/authentication";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { loadData } from "../utils/requests";
import { routes } from "../utils/utils";
import { Navbar } from "./Navbar";

// componenta asta o folosim pentru a aduce datele de autentificare despre user in timpul folosii aplicatiei
// daca de exemplu se modifica date despre userul conectat
// ne ajuta atunci cand adminul dezactiveaza contul userului si astfel userul este deconectat in timp real
export default function AuthGuard(props) {
    const {
        children
    } = props;
    // folosim useLocation pentru a vedea ruta din bara de url
    const location = useLocation();
    // folosim dispatch pentru a seta datele despre user in redux
    const dispatch = useDispatch();
    // folosim useNavigate pentru a naviga in aplicatie
    const navigate = useNavigate();
    // extragem datele despre user din redux
    const userDetails = useSelector(state => state.userDetails.data);
    // cu acest hook apelam endpoint-ul sa aducem datele despre user
    const authReq = useQuery('authentication', async () => {
          return loadData(
            "/api/v1/get/authenticate"
          )
      }, {
        onSuccess: (response) => {
          // daca contul este inactiv delogam si redirectam catre login
          if (response?.data?.status) {
            // daca contul este activ setam datele in redux si verificam daca contul este doctor si este un cont nou
            // daca este atunci redirectam catre update-profile ca medicul sa-si introduca datele despre studiile medicale
            dispatch(login(response?.data));
            if (response?.data?.new_account && response?.data?.account === "doctor") {
                navigate("/update-profile");
            } else {
              // daca nu este cont nou si indiferent de ce tip de cont este si il lasam pe pagina in care este el
              // de ex daca esti pe home si in timp ce esti pe pagina acest request se face, te va lasa tot pe pagina de home
              navigate(location.pathname);
            }
          } else {
            dispatch(logoff());
            navigate(location.pathname === "/register" ? location.pathname : "/login");
          }
        },
        onError: (error) => {
          // in caz de eroare delogam si redirectam userul catre login/register
          dispatch(logoff());
          navigate(location.pathname === "/register" ? location.pathname : "/login");
        }
      });
      // daca se acceseaza o ruta din cadrul aplicatiei si userul nu este conectat se afiseaza mesaj
      const routeList = routes
        .filter(route => route.path !== "/login" && route.path !== "/register")
        .filter(route => !route.disableNavbar)
        .map(route => route.path);
      if (!userDetails?.userid && routeList.includes(location.pathname) && !authReq?.isLoading) {
        return (
            <p>You need to log in !</p>
          )
      }
      if (authReq?.isLoading) {
        return <p>Loading...</p>;
      }
      return (
        <>
            {userDetails?.userid && routeList.includes(location.pathname) && <Navbar />}
            {children}
        </>
    ); 
}