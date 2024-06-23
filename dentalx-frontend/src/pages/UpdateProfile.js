import { Timeline } from "primereact/timeline";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import "../style/UpdateProfile.css";
import { useMutation, useQueryClient } from "react-query";
import { putData } from "../utils/requests";
import { TOAST_LIFE } from "../utils/utils";
import { useNavigate } from "react-router-dom";
import { UpdateDoctorForm } from "../components/DoctorForm";

const UpdateProfile = () => {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const toast = useRef(null);
    const queryClient = useQueryClient();
    // functie pentru a face navigarea intre pagini
    const navigate = useNavigate();
    // hook pentru modificarea datelor despre doctor
    const putMutation = useMutation((data) => putData(
        `/api/v1/put/doctor/${data.id}`,
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (result) => {
            if (result?.data) {
                // daca datele sunt cu succes afisam mesaj si revalidam datele de autentificare pentru a aduce noile modificari
                // si navigam catre pagina de home
                toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
                queryClient.removeQueries("authentication");
                navigate("/");
            }
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie care apeleaza hook-ul de mai sus
    const handleSubmitEvent = (data) => {
        putMutation.mutate({
            ...data,
            id: userDetails?.userid,
        });
    };
    // functionalitatea asta e vizibila pentru medicii care au proprietatea de new_account pe true
    // adica toti medicii care sunt noi in sistem si nu au datele medicale completate
    return (
        <div className="UpdateProfile">
            <Timeline value={["1", "2"]} layout="horizontal" align="top" className="Timeline" content={(item) => item} />
            <h3>Need to finish the registration</h3>
            <UpdateDoctorForm
                data={ {
                    degreenumber: userDetails.degreenumber,
                    degreeseries: userDetails.degreeseries,
                    graduationdate: null,
                    college: userDetails.college
                } }
                labelSubmit="Complete register"
                submit={ handleSubmitEvent }
            />
            <Toast ref={toast} />
        </div>
    )
}
export default UpdateProfile;
