import React, { useRef, useState } from "react";
import "../style/Profile.css";
import { useSelector } from "react-redux";
import { UpdatePatientForm } from "../components/PatientForm";
import { UpdateDoctorForm } from "../components/DoctorForm";
import { useMutation, useQueryClient } from "react-query";
import { putData } from "../utils/requests";
import { Toast } from "primereact/toast";
import { TOAST_LIFE } from "../utils/utils";
import { InputText } from "primereact/inputtext";
import { UpdatePasswordForm, UpdateUserForm } from "../components/UserForm";
import Dialog from "../components/Dialog";
import { Button } from "primereact/button";

export default function Profile() {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const toast = useRef(null);
    const queryClient = useQueryClient();
    const [openDialog, setOpenDialog] = useState(false);
    // hook pentru modificarea datelor despre userul conectat
    const putMutation = useMutation((data) => putData(
        data.operation === "password"
        ? `/api/v1/put/password/${data.userid}`
        : data.operation === "users"
        ? `/api/v1/put/users/${data.userid}`
        : data.operation === "doctor"
            ? `/api/v1/put/doctor/${data.userid}`
            : `/api/v1/put/patient/${data.userid}`,
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (result) => {
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
            queryClient.invalidateQueries("authentication");
        },
        onError: (result) => {
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie care apeleaza hook-ul de mai sus
    const handleOnSubmit = (data, operation) => {
        putMutation.mutate({
            ...data,
            userid: userDetails?.userid,
            operation
        })
    };
    // functie pentru inchiderea dialogului
    const handleOnCancelDialog = () => {
        setOpenDialog(false);
    };
    // functie care apeleaza hook-ul de mai sus pentru schimbarea parolei
    const handleOnChangePassword = (data) => {
        putMutation.mutate({
            ...data,
            userid: userDetails?.userid,
            operation: "password"
        });
        setOpenDialog(false);
    };
    // afisarea datelor despre user in functie de tipul de cont pe care il are userul conectat
    return (
        <div className="Profile">
            <Button
                label="Change password"
                onClick={ () => setOpenDialog(true) }
            />
            <div className="row-template-profile">
                <div className='row-cell-profile-1 profile-align-row-center'>
                    <h3>User data</h3>
                    <UpdateUserForm
                        data={ userDetails }
                        labelSubmit="Update User Info"
                        submit={ (data) => handleOnSubmit(data, "users") }
                    />
                </div>
                <div className='row-cell-profile-2 profile-align-row-center'>
                    <h3>{ userDetails?.account === "patient" ? "Patient data" : userDetails?.account === "doctor" ? "Medic data" : ""}</h3>
                    {
                        userDetails?.account === "patient" && (
                            <div className='profile-form'>
                                <div className='form-label'>
                                    <label
                                        htmlFor='doctorname'
                                    >Doctor name</label>
                                    <InputText
                                        id="doctorname"
                                        aria-describedby="doctorname"
                                        value={ `${userDetails?.doctorfirstname} ${userDetails?.doctorlastname}` }
                                        readOnly
                                    />
                                </div>
                            </div>
                        )
                    }
                    {
                        userDetails?.account === "doctor" && (
                            <UpdateDoctorForm
                                data={ userDetails }
                                labelSubmit="Update Doctor Info"
                                submit={ (data) => handleOnSubmit(data, "doctor") }
                            />
                        )
                    }
                    {
                        userDetails?.account === "patient" && (
                            <UpdatePatientForm
                                data={ userDetails }
                                labelSubmit="Update Patient Info"
                                submit={ (data) => handleOnSubmit(data, "patient") }
                            />
                        )
                    }
                </div>
            </div>
            <Dialog
                header={() => <h3>Update password</h3>}
                visible={ openDialog }
                onHide={ handleOnCancelDialog }
            >
                <UpdatePasswordForm
                    submit={ handleOnChangePassword }
                    cancel={ handleOnCancelDialog }
                />
            </Dialog>
            <Toast ref={toast} />
        </div>
    )
}