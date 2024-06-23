import React, { useRef, useState } from "react";
import "../style/Invitations.css";
import { TOAST_LIFE, useGetInvitations } from "../utils/utils";
import { useSelector } from "react-redux";
import { InvitationsTable } from "../components/InvitationsTable";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { AddInvitationForm, UpdateInvitationForm } from "../components/InvitationForm";
import { deleteData, putData, saveData } from "../utils/requests";
import { useMutation, useQueryClient } from "react-query";
import Dialog from "../components/Dialog";

export default function Invitations() {
    const toast = useRef(null);
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const queryClient = useQueryClient();
    // aducem lista de invitatii pentru pacienti/admini
    const invitationsData = useGetInvitations(userDetails?.account, userDetails?.userid);
    // aducem lista de invitatii pentru doctor despre pacientii care pleaca
    const invitationsOldData = useGetInvitations(userDetails?.account, userDetails?.userid, "oldDoctor");
    // aducem lista de invitatii pentru doctor despre pacientii care vin
    const invitationsNewData = useGetInvitations(userDetails?.account, userDetails?.userid, "newDoctor");
    // in selectedRow salvam linia din tabel
    const [selectedRow, setSelectedRow] = useState(null);
    // in selectedNewUpdateRow salvam linia din tabel din tabelul de invitatii despre pacientii care vin
    const [selectedNewUpdateRow, setSelectedNewUpdateRow] = useState(null);
        // in selectedPatUpdateRow salvam linia din tabel din tabelul de invitatii ale pacientului
    const [selectedPatUpdateRow, setSelectedPatUpdateRow] = useState(null);
        // in selectedOldUpdateRow salvam linia din tabel din tabelul de invitatii despre pacientii care pleaca
    const [selectedOldUpdateRow, setSelectedOldUpdateRow] = useState(null);
    // hook pentru modificarea/adaugarea/stergerea unei invitatii
    const invitationMutation = useMutation((data) => data?.operation === "update"
        ? putData(
            `/api/v1/put/invitation/${data?.id}`,
            {
                credentials: "include"
            },
            data
        )
        : data?.operation === "add"
        ? saveData(
            "/api/v1/posts/invitation",
            {
                credentials: "include"
            },
            data
        )
        : deleteData(
            `/api/v1/delete/invitation/${data.id}`,
            {
                credentials: "include"
            },
            data
    ), {
        onSuccess: (response) => {
            if (userDetails?.account === "patient") {
                queryClient.invalidateQueries("authentication");
            }
            queryClient.invalidateQueries(`${userDetails?.userid}-invitations-list`);
            queryClient.invalidateQueries(`${userDetails?.userid}-oldDoctor-invitations-list`);
            queryClient.invalidateQueries(`${userDetails?.userid}-newDoctor-invitations-list`);
            queryClient.invalidateQueries(`${userDetails?.userid}-number-invitations-list`);
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie pentru initializarea dialogului
    const handleOnOpenDialog = () => {
        setSelectedRow({
            id: "",
            old_doctor: "",
            patient: "",
            new_doctor: ""
        });
    };
    // functie pentru inchiderea dialogului si resetarea lui
    const handleOnCancelInvitation = () => {
        setSelectedRow(null);
        setSelectedNewUpdateRow(null);
        setSelectedOldUpdateRow(null);
        setSelectedPatUpdateRow(null);
    };
    // functie care creaza o invitatie
    const handleOnCreateInvitation = (data) => {
        invitationMutation.mutate({ ...data, operation: "add" });
        handleOnCancelInvitation();
    };
    // functie care sterge o invitatie
    const handleOnDeleteInvitation = (dataRow) => {
        invitationMutation.mutate(dataRow);
    };
    // functie care accepta o invitatie
    const handleOnAcceptInvitation = (dataRow, status_key) => {
        invitationMutation.mutate({...dataRow, [status_key]: true, operation: "update" });
    };
    // functie pentru a refuza o invitatie
    const handleOnDeclineInvitation = (dataRow, status_key) => {
        if (status_key?.includes("old_doctor")) {
            setSelectedOldUpdateRow({ ...dataRow, [status_key]: false });
        } else if (status_key?.includes("patient")) {
            setSelectedPatUpdateRow({ ...dataRow, [status_key]: false });
        } else {
            setSelectedNewUpdateRow({ ...dataRow, [status_key]: false });
        }
    };
    // functie pentru a modifica statusul invitatiei cu detalii
    const handleOnUpdateInvitation = (data) => {
        if (selectedNewUpdateRow) {
            invitationMutation.mutate({ ...data, details_new_doctor: data.details, operation: "update" });
        } else if (selectedPatUpdateRow) {
            invitationMutation.mutate({ ...data, details_patient: data.details, operation: "update" });
        } else {
            invitationMutation.mutate({ ...data, details_old_doctor: data.details, operation: "update" });
        }
        handleOnCancelInvitation();
    };
    // functie pentru afisarea tipurilor de actiuni pentru fiecare linie in functie de tipul de user conectat
    const actionsBtn = (dataRow, status_key) => {
        if (userDetails?.account === "admin") {
            return (
                <Button label="Delete" onClick={() => handleOnDeleteInvitation(dataRow) } />
            );
        }
        if (userDetails?.account !== "admin") {
            if (dataRow?.[status_key] === null) {
                return (
                    <>
                        <Button label="Accept" className="mr-10" onClick={() => handleOnAcceptInvitation(dataRow, status_key) } />
                        <Button label="Decline" onClick={() => handleOnDeclineInvitation(dataRow, status_key) } />
                    </>
                );
            } else {
                return undefined;
            }
        }
        return undefined;
    };
    // afisarea tabelelor de invitatii in functie de tipul de user conectat
    if (userDetails?.account === "doctor") {
        return (
            <div className="Invitations">
                <div>
                    <h3>Patients that are leaving</h3>
                    <InvitationsTable
                        data={
                            invitationsOldData?.data?.data ?? []
                        }
                        actionsBtn={ (dataRow) => actionsBtn(dataRow, "status_old_doctor") }
                    />
                </div>
                <div>
                    <h3>Patients that are comming</h3>
                    <InvitationsTable
                        data={
                            invitationsNewData?.data?.data ?? []
                        }
                        actionsBtn={ (dataRow) => actionsBtn(dataRow, "status_new_doctor") }
                    />
                </div>
                <Dialog
                    header={() => <h3>Decline invitation</h3>}
                    visible={ !!(selectedNewUpdateRow || selectedOldUpdateRow || selectedPatUpdateRow) }
                    onHide={ handleOnCancelInvitation }
                >
                    <UpdateInvitationForm
                        data={ selectedNewUpdateRow ?? selectedOldUpdateRow ?? selectedPatUpdateRow }
                        labelSubmit="Decline invitation"
                        submit={ handleOnUpdateInvitation }
                        cancel={ handleOnCancelInvitation }
                    />
                </Dialog>
                <Toast ref={toast} />
            </div>
        )
    } else if (userDetails?.account === "patient" || userDetails?.account === "admin") {
        return (
            <div className="Invitations">
                {
                    userDetails?.account === "admin" && (
                        <Button label="Add Invitation" onClick={() => handleOnOpenDialog() } />
                    )
                }
                <div>
                    <h3>Invitations</h3>
                    <InvitationsTable
                        data={
                            invitationsData?.data?.data ?? []
                        }
                        actionsBtn={ (dataRow) => actionsBtn(dataRow, "status_patient") }
                    />
                </div>
                <Dialog
                    header={() => <h3>{selectedPatUpdateRow ? "Decline invitation" : "Create invitation"}</h3>}
                    visible={ !!(selectedRow || selectedPatUpdateRow) }
                    onHide={ handleOnCancelInvitation }
                >
                    { selectedPatUpdateRow ? (
                        <UpdateInvitationForm
                            data={ selectedPatUpdateRow }
                            labelSubmit="Decline invitation"
                            submit={ handleOnUpdateInvitation }
                            cancel={ handleOnCancelInvitation }
                        />
                    ) : (
                        <AddInvitationForm
                            data={ selectedRow }
                            labelSubmit="Create invitation"
                            submit={ handleOnCreateInvitation }
                            cancel={ handleOnCancelInvitation }
                        />
                    )}
                </Dialog>
                <Toast ref={toast} />
            </div>
        )
    }
    return null;
}