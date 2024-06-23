import React from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { event_type } from "../utils/utils";

export function ReservationsTable(props) {
    const {
        reservationsList
    } = props;
    // functie pentru afisa data calendaristica in formatul pe care il vrem pe fiecare linie
    const bodyDate = (dataRow, key) => {
        return dataRow?.[key] ? new Date(dataRow?.[key] ?? null)?.toLocaleString("en-US") : "";
    };
    // functie pentru a afisa tipul de eveniment facut in formatul pe care il vrem
    const bodyResType = (dataRow) => {
        return dataRow.type === "meeting" ? "Meeting" : event_type?.find(even => even?.code === dataRow?.type)?.name;
    };
    // functie pentru a afisa statusul evenimentului
    const bodyStatus = (dataRow) => {
        return dataRow?.status ? "Active" : "Inactive"
    };
    return (
        <>
            <DataTable
                value={ reservationsList ?? [] }
                // folosim rows si paginator pentru a afisa partea de paginatii la tabel, daca depaseste 7 linii in tabel
                // apare paginatia
                rows={7}
                paginator={ reservationsList?.length > 7 ? true : false }
            >
                <Column field="name" header="Name"></Column>
                <Column field="startdate" header="Start Date" body={ (dataRow) => bodyDate(dataRow, "startdate") }></Column>
                <Column field="enddate" header="End Date" body={ (dataRow) => bodyDate(dataRow, "enddate") }></Column>
                <Column field="type" header="Reservation Type" body={ bodyResType }></Column>
                <Column field="createdby" header="Created By"></Column>
                <Column field="doctor" header="Doctor"></Column>
                <Column field="status" header="Status" body={ bodyStatus }></Column>
            </DataTable>
        </>
    );
}