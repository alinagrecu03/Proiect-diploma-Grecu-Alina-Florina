import React from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export function InvitationsTable(props) {
    const {
        data,
        expandedRows,
        rowExpansionTemplate,
        onRowExpand,
        actionsBtn
    } = props;
    const bodyStatus = (dataRow, key) => {
        return (
            dataRow?.[key] ? "Accept" : dataRow?.[key] === null ? "Pending" : "Decline"
        )
    };
    return (
        <DataTable
            // folosim rows si paginator pentru a afisa partea de paginatii la tabel, daca depaseste 7 linii in tabel
            // apare paginatia
            rows={7}
            paginator={ data?.length > 7 ? true : false }
            value={data ?? []}
            expandedRows={ expandedRows }
            rowExpansionTemplate={ rowExpansionTemplate }
            onRowToggle={ (event) => onRowExpand(event.data) }
        >
            <Column field="old_doctor_name" header="Old doctor name"></Column>
            <Column field="patient_name" header="Patient name"></Column>
            <Column field="new_doctor_name" header="New doctor name"></Column>
            <Column field="status_old_doctor" header="Status old doctor" body={ (dataRow) => bodyStatus(dataRow, "status_old_doctor") }></Column>
            <Column field="status_patient" header="Status patient" body={ (dataRow) => bodyStatus(dataRow, "status_patient") }></Column>
            <Column field="status_new_doctor" header="Status new doctor" body={ (dataRow) => bodyStatus(dataRow, "status_new_doctor") }></Column>
            <Column field="details_old_doctor" header="Details old doctor"></Column>
            <Column field="details_patient" header="Details patient"></Column>
            <Column field="details_new_doctor" header="Details new doctor"></Column>
            { actionsBtn && (<Column header="Actions" body={ actionsBtn }></Column>)}
        </DataTable>
    );
}