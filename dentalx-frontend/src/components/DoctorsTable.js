import React from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button";
import { useSelector } from "react-redux";

export function DoctorsTable(props) {
    const {
        doctorMutation,
        doctorList
    } = props;
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    // functie care apeleaza hook-ul pentru stergerea unui medic
    const handleOnDeleteDoc = (dataRow) => {
        doctorMutation.mutate({ id: dataRow.userid });
    };
    // functie pentru dezactivarea contului de medic
    const handleOnChangeStatus = (dataRow) => {
        doctorMutation.mutate({ id: dataRow.userid, status: !dataRow?.status, operation: "status" });
    };
    // functie pentru afisarea tipurilor de actiuni pentru fiecare linie
    const actionsBtn = (dataRow) => {
        return (
            <div>
                {
                    userDetails?.account === "admin" && (
                        <Button label={!dataRow?.status ? "Active" : "Inactive"} className="mr-10" onClick={ () => handleOnChangeStatus(dataRow) } />
                    )
                }
                <Button label="Delete" onClick={ () => handleOnDeleteDoc(dataRow) } />  
            </div>       
        )
    };
    // functie pentru afisarea datei calendaristice intr-un anumit format pentru fiecare linie
    const bodyDate = (dataRow, key) => {
        return dataRow?.[key] ? new Date(dataRow?.[key] ?? null)?.toLocaleDateString("en-GB") : "";
    };
    // functie pentru afisarea statusului contului
    const bodyStatus = (dataRow) => {
        return (
            <p>{dataRow?.status ? "Active" : "Inactive"}</p>
        )
    };
    return (
        <>
            <DataTable
                // folosim rows si paginator pentru a afisa partea de paginatii la tabel, daca depaseste 7 linii in tabel
                // apare paginatia
                rows={7}
                paginator={ doctorList?.length > 7 ? true : false }
                value={doctorList ?? []}
            >
                <Column field="email" header="Email"></Column>
                <Column field="firstname" header="Firstname"></Column>
                <Column field="lastname" header="Lastname"></Column>
                <Column field="degreenumber" header="Profession"></Column>
                <Column field="degreeseries" header="Specialization"></Column>
                <Column field="graduationdate" header="Graduation Date" body={(dataRow) => bodyDate(dataRow, "graduationdate")}></Column>
                {
                    userDetails?.account === "admin" && (
                        <Column field="status" header="Account status" body={ bodyStatus }></Column>
                    )
                }
                <Column header="Actions" body={ actionsBtn }></Column>
            </DataTable>
        </>
    );
}