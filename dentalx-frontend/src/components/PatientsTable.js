import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AffectionsForm } from "./PatientForm";
import { Button } from "primereact/button";
import Dialog from "./Dialog";
import { UpdateUserForm } from "./UserForm";

export function PatientsTable(props) {
    const {
        patientMutation,
        userMutation,
        patientList
    } = props;
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    // salvam in aceasta variabila datele de pe un rand selectat, adica cand apasam pe butonul de expandare
    const [expandedRows, setExpandedRows] = useState([]);
    // salvam in aceste 4 variabile care incep cu open o valoare booleana pentru a stii ce tip de afectiune modificam
    // si implicit dialogul sa stie pe ce actiuni facem
    const [openAffPat, setOpenAffPat] = useState(false);
    const [openAllerPat, setOpenAllerPat] = useState(false);
    const [openInterPat, setOpenInterPat] = useState(false);
    const [openTreatPat, setOpenTreatPat] = useState(false);
    // in selectedRow salvam linia din tabel
    const [selectedRow, setSelectedRow] = useState(null);
    // functie care se apeleaza cand se expandeaza o linie
    const onRowExpand = (dataRow) => {
        setExpandedRows(dataRow);
    };
    // functie pentru a deschide dialogul pentru fiecare afectiune in parte
    const onAffecDialogClick = (type) => {
        if (type === "affection") {
            setOpenAffPat(true);
        } else if (type === "allergie") {
            setOpenAllerPat(true);
        } else if (type === "intervention") {
            setOpenInterPat(true);
        } else if (type === "treatment") {
            setOpenTreatPat(true);
        }
    };
    // resetam dialogul
    const handleOnCancelAffPatient = () => {
        setOpenAffPat(false);
        setOpenAllerPat(false);
        setOpenInterPat(false);
        setOpenTreatPat(false);
    };
    // functie care apeleaza hook-ul care sterge o afectiune
    const handleDeleteAffPatient = (id, deleteElem, key) => {
        const patientData = patientList?.find((patient) => patient.userid === id);
        if (patientData) {
            patientMutation.mutate({
                ...patientData,
                id: id,
                [key]: patientData?.[key].filter((element) => element !== deleteElem)
            });
        }
    };
    // functie pentru a afisa tipul de actiune pentru fiecare affectiune in parte in functie de tipul de cont
    const bodyAffections = (id, element, key) => {
        if (userDetails?.account !== "doctor") {
            return null;
        }
        return (
            <Button label="Delete" onClick={ () => handleDeleteAffPatient(id, element, key) } />
        )
    };
    // functie care apeleaza hook-ul care adauga o afectiune la un pacient
    const handleOnSubmitAffPatient = (formData, key) => {
        const patientData = patientList?.find((patient) => patient.userid === formData.id);
        if (patientData) {
            patientMutation.mutate({
                ...patientData,
                id: formData.id,
                [key]: patientData?.[key]?.concat(formData?.[key])
            });
        }
        handleOnCancelAffPatient();
    };
    // tipul de afectiune pentru care deschidem dialogul
    const formKey = openAffPat ? "affections" : openAllerPat ? "allergies" : openInterPat ? "interventions" : openTreatPat ? "treatments" : "";
    // template de ce sa se afiseze cand se expandeaza o linie
    const rowExpansionTemplate = (dataRow) => {
        return (
                <div className="row-template">
                    <div className='row-cell-1'>
                        <h3>Affections</h3>
                        {
                            userDetails?.account === "doctor" && (
                                <Button label="Add Affections" className='my-10' onClick={ () => onAffecDialogClick("affection") } />
                            )
                        }
                        <DataTable
                            value={dataRow?.affections?.map((dat) => ({ affection: dat })) ?? []}
                        >
                            <Column
                                field="affection"
                                header="Affection"
                            ></Column>
                            {
                                userDetails?.account === "doctor" && (
                                    <Column header="Actions" body={ (affect) => bodyAffections(dataRow?.userid, affect?.affection, "affections") }></Column>
                                )
                            }
                        </DataTable>
                    </div>
                    <div className='row-cell-2'>
                        <h3>Allergies</h3>
                        {
                            userDetails?.account === "doctor" && (
                                <Button label="Add Allergies" className='my-10' onClick={ () => onAffecDialogClick("allergie") } />
                            )
                        }
                        <DataTable
                            value={dataRow?.allergies?.map((dat) => ({ allergie: dat })) ?? []}
                        >
                            <Column field="allergie" header="Allergie"></Column>
                            {
                                userDetails?.account === "doctor" && (
                                    <Column header="Actions" body={ (aller) => bodyAffections(dataRow?.userid, aller?.allergie, "allergies") }></Column>
                                )
                            }
                        </DataTable>
                    </div>
                    <div className='row-cell-3'>
                        <h3>Interventions</h3>
                        {
                            userDetails?.account === "doctor" && (
                                <Button label="Add Interventions" className='my-10' onClick={ () => onAffecDialogClick("intervention") } />
                            )
                        }
                        <DataTable
                            value={dataRow?.interventions?.map((dat) => ({ intervention: dat })) ?? []}
                        >
                            <Column field="intervention" header="Intervention"></Column>
                            {
                                userDetails?.account === "doctor" && (
                                    <Column header="Actions" body={ (inter) => bodyAffections(dataRow?.userid, inter?.intervention, "interventions") }></Column>
                                )
                            }
                        </DataTable>
                    </div>
                    <div className='row-cell-4'>
                        <h3>Treatments</h3>
                        {
                            userDetails?.account === "doctor" && (
                                <Button label="Add Treatments" className='my-10' onClick={ () => onAffecDialogClick("treatment") } />
                            )
                        }
                        <DataTable
                            value={dataRow?.treatments?.map((dat) => ({ treatment: dat })) ?? []}
                        >
                            <Column field="treatment" header="Treatment"></Column>
                            {
                                userDetails?.account === "doctor" && (
                                    <Column header="Actions" body={ (treat) => bodyAffections(dataRow?.userid, treat?.treatment, "treatments") }></Column>
                                )
                            }
                        </DataTable>
                    </div>
                    {
                        userDetails?.account === "doctor" && (
                            <>
                                <Dialog
                                    header={() => <h3>Add {formKey}</h3>}
                                    visible={ openAffPat || openAllerPat || openInterPat || openTreatPat }
                                    onHide={ handleOnCancelAffPatient }
                                >
                                    <AffectionsForm
                                        patientId={ dataRow?.userid }
                                        formKey={ formKey }
                                        keyLabel={ openAffPat ? "Affections" : openAllerPat ? "Allergies" : openInterPat ? "Interventions" : openTreatPat ? "Treatments" : "" }
                                        submit={ (data) => handleOnSubmitAffPatient(data, formKey) }
                                        cancel={ handleOnCancelAffPatient }
                                    />
                                </Dialog>
                            </>
                        )
                    }
                </div>
        );
    };
    // functie care apeleaza hook-ul care sterge un pacient din baza de date
    const handleOnDeletePat = (dataRow) => {
        userMutation.mutate({ id: dataRow.userid, operation: "delete" });
        setSelectedRow(null);
    };
    // selectam pacientul pentru care vrem sa ii modificam datele
    const handleOnUpdatePat = (dataRow) => {
        setSelectedRow(dataRow);
    };
    // functie care dezactiveaza contul pacientului
    const handleOnChangeStatus = (dataRow) => {
        userMutation.mutate({ id: dataRow.userid, status: !dataRow?.status, operation: "status" });
    };
    // tipurile de actiuni in functie de tipul de cont
    const actionsBtn = (dataRow) => {
        return (
            <div>
                {
                    userDetails?.account === "admin" && (
                        <Button label="Delete" className="mr-10" onClick={ () => handleOnDeletePat(dataRow) } />
                    )
                }
                {
                    userDetails?.account === "admin" && (
                        <Button label={!dataRow?.status ? "Active" : "Inactive"} className="mr-10" onClick={ () => handleOnChangeStatus(dataRow) } />
                    )
                }
                <Button label="Update" onClick={ () => handleOnUpdatePat(dataRow) } />
            </div>
        )
    };
    // functie care apeleaza hook-ul care modifica datele unui pacient
    const handleOnUpdatePatient = (data) => {
        userMutation.mutate({
            id: selectedRow.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            account: selectedRow.account,
            operation: "update"
        });
        setSelectedRow(null);
    };
    // resetam variabila
    const handleOnCancelPatient = () => {
        setSelectedRow(null);
    };
    // functie pentru afisarea statusul contului unui pacient pentru fiecare linie
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
                paginator={ patientList?.length > 7 ? true : false }
                expandedRows={ expandedRows }
                value={patientList ?? []}
                rowExpansionTemplate={ (dataRow) => userDetails?.account === "doctor"
                ? rowExpansionTemplate(dataRow) : undefined }
                onRowToggle={ (event) => userDetails?.account === "doctor"
                ? onRowExpand(event.data) : undefined }
            >
                <Column field="" header="Expand" expander={ userDetails?.account === "doctor" }></Column>
                <Column field="firstname" header="Firstname"></Column>
                <Column field="lastname" header="Lastname"></Column>
                <Column field="email" header="Email"></Column>
                {
                    userDetails?.account === "admin" && (
                        <Column field="doctoremail" header="Doctor Email"></Column>
                    )
                }
                                {
                    userDetails?.account === "admin" && (
                        <Column field="doctorfirstname" header="Doctor Firstname"></Column>
                    )
                }
                                {
                    userDetails?.account === "admin" && (
                        <Column field="doctorlastname" header="Doctor Lastname"></Column>
                    )
                }
                {
                    userDetails?.account === "admin" && (
                        <Column field="status" header="Account status" body={ bodyStatus }></Column>
                    )
                }
                <Column header="Actions" body={ actionsBtn }></Column>
            </DataTable>
            <Dialog
                header={() => <h3>Update patient</h3>}
                visible={ !!selectedRow }
                onHide={ handleOnCancelPatient }
            >
                <UpdateUserForm
                    data={ selectedRow }
                    submit={ handleOnUpdatePatient }
                    cancel={ handleOnCancelPatient }
                />
            </Dialog>
        </>
    );
}