import React, { useRef } from "react";
import { ReservationsTable } from "./ReservationsTable";
import { useGetReservations } from "../utils/utils";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";

export default function HomeAdmin() {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const toastRef = useRef();
    const eventsList = useGetReservations(userDetails?.account, userDetails?.userid, userDetails?.doctorid);
    return (
        <div>
            {/* Folosim acest toast pentru a afisa notificari */}
            <Toast ref={toastRef} />
            <ReservationsTable
                reservationsList={ eventsList?.data?.data ?? [] }
            />
        </div>
    );
}