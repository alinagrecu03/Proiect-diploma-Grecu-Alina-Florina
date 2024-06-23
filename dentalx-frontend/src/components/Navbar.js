import React, { useCallback, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { loadData } from "../utils/requests";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoff } from '../redux/actions/authentication';
import { Menu } from "primereact/menu";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { routes, useGetNumberInvitations } from "../utils/utils";
import { Badge } from "primereact/badge";

// meniul aplicatiei
export function Navbar() {
    // functie pentru navigarea in aplicatie
    const navigate = useNavigate();
    // functie pentru setarea datelor in redux
    const dispatch = useDispatch();
    const menuProfile = useRef(null);
    const queryClient = useQueryClient();
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    // extragerea numarului de invitatii noi pentru user
    const numberInvitationQuery = useGetNumberInvitations(userDetails?.account, userDetails?.userid);
    // hook pentru operatiunea de logoff
    const logoffMutation = useMutation(() => loadData(
        "/api/v1/get/logoff",
        {}
    ), {
        onSettled: () => {
            queryClient.invalidateQueries("authentication");
            navigate("/login");
        }
    });
    // functie pentru randarea fiecarei optiuni din meniu
    const renderItem = useCallback((item) => (
        <>
            <span className={item.icon} />
            <span className="p-menuitem-text">{item.label}</span>
            {/* cu item.badge afisam numarul de invitatii noi pentru user */}
            {!!item.badge && <Badge className="badge-box" value={item.badge} />}
        </>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [userDetails.account]);
    // convertim numarul de invitatii din string in number
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const numberInvitation = useMemo(() => !Number.isNaN(numberInvitationQuery?.data?.data?.number_invitations) ? parseInt(numberInvitationQuery?.data?.data?.number_invitations, 10) : 0, [numberInvitationQuery?.data?.data?.number_invitations]);
    // iteram prin lista de optiuni si generam un array de obiecte
    // componenta de meniu din primereact asteapta un arrat de obiecte
    const items = useMemo(() => routes
        .filter((route) => route.path !== "login" && route.path !== "/register" && route.path !== "/profile")
        .filter((route) => !route.disableNavbar)
        .map((route) => route.rights.includes(userDetails?.account)
        ? ({
            label: route.name,
            icon: route.icon,
            badge: userDetails?.account !== "admin" && route.path === "/invitations" ? numberInvitation : 0,
            // command reprezinta actiunea care sa se execute cand se da click
            // in cazul nostru navigam la pagina dorita
            command: () => navigate(route.path),
            template: renderItem
        })
        : null)
        .filter(route => route),
        // eslint-disable-next-line
        [userDetails.account, numberInvitation, renderItem]);
    // functie pentru operatiunea de logoff
    const handleOnLogOut = () => {
        dispatch(logoff());
        logoffMutation.mutate();
        queryClient.clear();
    };
    // optiunile din meniul secundar din dreapta de la avatar
    const itemsProfile = [
        {
            label: 'Profile',
            icon: "pi pi-user-edit",
            command: () => navigate('/profile')
        },
        {
            label: 'Logout',
            icon: "pi pi-sign-out",
            command: () => handleOnLogOut()
        }
    ];
    const start = <img alt="logo" src="/logo.png" height="30" width="30" style={{ margin: "0 20px 0 0" }}></img>;
    const end = (
        <div>
            <Avatar
                label={ `${userDetails?.firstname?.[0]?.toUpperCase() ?? ""}${userDetails?.lastname?.[0]?.toUpperCase() ?? ""}` }
                shape="circle"
                onClick={(event) => menuProfile.current.toggle(event)}
                aria-controls="popup_menu_left"
                aria-haspopup
            />
            <Menu model={itemsProfile} popup ref={menuProfile} id="popup_menu_left" />
        </div>
    );
    return (
        <div className="Navbar">
            <Menubar className="menubar" model={items} start={start} end={end} />
        </div>
    )
};