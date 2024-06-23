import React from "react";
import { useSelector } from "react-redux";
import { routes } from "../utils/utils";
import { useLocation } from "react-router-dom";

export default function PermissionGuard(props) {
    const {
        children
    } = props;
    const location = useLocation();
    const userDetails = useSelector(state => state.userDetails.data);
    const allPermission = location.pathname === "/login" || location.pathname === "/register";
    const findRights = routes?.filter((route) => (!userDetails?.new_account && route?.path !== "/update-profile") || userDetails?.new_account)
    .find((route) => location?.pathname === route?.path)?.rights;
    const userHasPerm = findRights?.includes(userDetails?.account);
    if (findRights) {
        if (userHasPerm || allPermission) {
            return (
                <div>
                    {children}
                </div>
            );
        } else {
            return <p>You don't have permissions for that feature, please contact the admin</p>
        }
    } else if (!!userDetails?.userid && !findRights) {
        return (
            <div>
                {children}
            </div>
        );
    }
}