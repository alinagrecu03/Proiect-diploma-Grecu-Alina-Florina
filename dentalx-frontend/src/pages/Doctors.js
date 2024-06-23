import React, { useRef, useState } from 'react';
import { TOAST_LIFE, useGetDoctors } from '../utils/utils';
import { Toast } from 'primereact/toast';
import { useMutation, useQueryClient } from 'react-query';
import { deleteData, putData } from '../utils/requests';
import "../style/Doctors.css";
import { useSelector } from 'react-redux';
import ErrorPage from '../components/ErrorPage';
import { Loading } from '../components/Loading';
import { DoctorsTable } from '../components/DoctorsTable';
import { InputText } from 'primereact/inputtext';

export default function Doctors() {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const toast = useRef(null);
    // aducem lista de doctori din baza de date in functie de id ul userului conectat (admin)
    const doctorList = useGetDoctors(userDetails?.userid);
    const queryClient = useQueryClient();
    // stocam informatia de pe filtru din interfata pentru a o folosi mai jos
    const [filterVal, setFilterVal] = useState("");
    // cu acest hook facem operatiile de stergere si dezactivare/activare cont ale unui medic
    const doctorMutation = useMutation((data) => data?.operation === "status"
        ? putData(
            `/api/v1/put/status-account/${data?.id}`,
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
            // invalidam lista ca sa provocam request-ul sa se refaca si astfel sa aduca date noi si lista sa fie actualizata
            queryClient.invalidateQueries(`${userDetails?.userid}-doctor-list`);
            // afisam mesaj de succes
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
    // pana se executa request-ul afisam un mesaj de loading, sau eroare in caz contrar
    if (doctorList?.isLoading) {
        return <Loading />
    }
    if (doctorList?.isError) {
        return <ErrorPage />
    }
    return (
        <div className='Doctors'>
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
            <DoctorsTable
                doctorList={ (doctorList?.data?.data ?? [])
                    .filter(doctor => (doctor?.firstname?.toLowerCase().includes(filterVal?.toLowerCase())
                    || doctor?.lastname?.toLowerCase().includes(filterVal?.toLowerCase())
                    || (doctor?.firstname + " " + doctor?.lastname)?.toLowerCase().includes(filterVal?.toLowerCase())))
                 }
                doctorMutation={ doctorMutation }
            />
            <Toast ref={toast} />
        </div>
    )
}