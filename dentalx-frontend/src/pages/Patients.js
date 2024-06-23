import React, { useRef, useState } from 'react';
import { TOAST_LIFE, useGetPatients } from '../utils/utils';
import { Button } from 'primereact/button';
import { AddPatientForm } from '../components/PatientForm';
import Dialog from '../components/Dialog';
import { Toast } from 'primereact/toast';
import { useMutation, useQueryClient } from 'react-query';
import { deleteData, putData, saveData } from '../utils/requests';
import "../style/Patients.css";
import { PatientsTable } from '../components/PatientsTable';
import { useSelector } from 'react-redux';
import ErrorPage from '../components/ErrorPage';
import { Loading } from '../components/Loading';
import { InputText } from 'primereact/inputtext';

export default function Patients() {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const toast = useRef(null);
    // aducem lista de pacienti in functie de tipul de cont (doctor/admin) si id-ul userului in cazul in care userul conectat este medic
    const patientList = useGetPatients(userDetails?.account, userDetails?.userid);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    // stocam informatia de pe filtru din interfata pentru a o folosi mai jos
    const [filterVal, setFilterVal] = useState("");
    const queryClient = useQueryClient();
    // functia/hook-ul pentru adaugarea/modificarea unui pacient
    const patientMutation = useMutation((data) => !!data?.id
        ? putData(
            `/api/v1/put/patient/${data?.id}`,
            {
                credentials: "include"
            },
            data
        )
        : saveData(
            "/api/v1/posts/patient",
            {
                credentials: "include"
            },
            data
    ), {
        onSuccess: (response) => {
            // invalidam query-ul ca sa aducem noua lista de date despre pacienti
            queryClient.invalidateQueries(`${userDetails?.userid}-patient-list`);
            // afisam mesaj de succes ca notificare
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie pentru trimiterea datelor despre noul pacient catre backend, apeleaza hook-ul useMutation care face request-ul de tip POST/PUT sa adauge/modifice un pacient
    const handleOnAddPatient = (data) => {
        // patientMutation e hook-ul useMutation pentru adaugarea/modificarea unui pacient
        patientMutation.mutate(data);
        // resetam dialog-ul
        handleOnCancelPatient();
    };
    const handleOnCancelPatient = () => {
        setOpenAddDialog(false);
    };
    // functia/hook-ul pentru stergerea/modificarea/dezactivarea/activarea unui user
    const userMutation = useMutation((data) => (data?.operation === "update" || data?.operation === "status")
    ? putData(
        data?.operation === "status" ? `/api/v1/put/status-account/${data?.id}` : `/api/v1/put/users/${data?.id}`,
        {
            credentials: "include"
        },
        data
    )
    : deleteData(
        `/api/v1/delete/users/${data?.id}`,
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            // invalidam query-ul ca sa aducem noua lista de date despre pacienti
            queryClient.invalidateQueries(`${userDetails?.userid}-patient-list`);
            // afisam mesaj de succes ca notificare
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie pentru a extrage informatia introdusa in campul text de filtru
    const handleOnChange = (value) => {
        setFilterVal(value);
    };
    // daca lista se incarca afisam componenta de Loading
    if (patientList?.isLoading) {
        return <Loading />
    }
    // daca request-ul s-a facut cu eroare afisam pagina de eroare
    if (patientList?.isError) {
        return <ErrorPage />
    }
    // medicii si adminii pot vedea pagina asta
    return (
        <div className='Patients'>
            {/* Daca userul este medic afisam butonul de adaugare */}
            {
                userDetails?.account === "doctor" && (
                    <Button label='Add Patient' className='my-10' onClick={ () => setOpenAddDialog(true) } />
                )
            }
            <div className='my-10 filter-content'>
                <div className='form-label'>
                    <label htmlFor='filter'>Filter</label>
                    <InputText
                        id="filter"
                        aria-describedby="filter"
                        value={ filterVal }
                        onChange={(e) => handleOnChange(e.target.value)}
                    />
                </div>
            </div>
            <PatientsTable
                patientMutation={ patientMutation }
                userMutation={ userMutation }
                // filtram lista de pacienti in functie de variabila filter care stocheaza informatia de pe filtru
                patientList={ (patientList?.data?.data ?? [])
                    .filter(patient => (patient?.firstname?.toLowerCase().includes(filterVal?.toLowerCase())
                    || patient?.lastname?.toLowerCase().includes(filterVal?.toLowerCase())
                    || (patient?.firstname + " " + patient?.lastname)?.toLowerCase().includes(filterVal?.toLowerCase())))
                 }
            />
            {/* Daca userul este medic afisam dialogul de adaugare al unui pacient */}
            {
                userDetails?.account === "doctor" && (
                    <Dialog
                        header={() => <h3>Add a patient</h3>}
                        visible={ openAddDialog }
                        onHide={() => handleOnCancelPatient()}
                    >
                        <AddPatientForm
                            submit={ handleOnAddPatient }
                            cancel={ handleOnCancelPatient }
                        />
                    </Dialog>
                )
            }
            <Toast ref={toast} />
        </div>
    )
}