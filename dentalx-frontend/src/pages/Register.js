import React, { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { saveData } from '../utils/requests';
import { Link, useNavigate } from 'react-router-dom';
import "../style/Register.css";
import { TOAST_LIFE, useGetAccountType } from '../utils/utils';
import { Toast } from 'primereact/toast';
import { Dropdown } from "primereact/dropdown";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';   
import { Button } from 'primereact/button';

export default function Register() {
    // functie pentru navigare in aplicatie
    const navigate = useNavigate();
    const toast = useRef(null);
    const [form, setForm] = useState({
        email: "",
        password: "",
        account: "",
        firstname: "",
        lastname: ""
    });
    // aducem tipurile de conturi care exista in aplicatie
    const accountTypes = useGetAccountType();
    // cu acest hook face operatiunea de inregistrare a unui cont nou
    const saveMutation = useMutation((data) => saveData(
        "/api/v1/posts/register",
        {},
        data
    ), {
        onSuccess: (response) => {
            // daca contul a fost inregistrat cu succes il redirectam catre pagina de login
            // altfel afisam un mesaj daca email-ul deja exista in sistem
            if (response?.data) {
                navigate("/login");
            } else if (response?.error === "Email already exist in database") {
                toast.current.show({severity:'error', summary: 'Error', detail:'Email already exist in database', life: TOAST_LIFE});
            }
        },
        onError: (error) => {
            
        }
    });
    // functie pentru a seta datele de pe campuri
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    // functie care apeleaza hook-ul de mai sus
    const handleSubmitEvent = () => {
        if (form.email && form.firstname && form.lastname && form.password && form.account) {
            saveMutation.mutate({
                ...form,
                accountType: accountTypes?.data?.data?.find((acc) => acc.id === form.account)?.type
            });
        }
    };
    // cream lista de optiuni de conturi si scoate pacientul pentru ca doar adminii si doctorii se pot inregistra
    // in aplicatie prin pagina de register, pacientii sunt creati de catre medici
    const accountOptionList = (accountTypes?.data?.data ?? [])
    .filter((account) => account.type !== "patient")
    .map((account) => ({ code: account.id, name: account.type }));
    return (
        <div className='Register'>
            <div className='register-info'>
            </div>
            <div className='register-credentials'>
                <div className='profile-form'>
                    <h1>Register</h1>
                    <div className='form-label'>
                        <label htmlFor='firstname'>Firstname</label>
                        <InputText
                            name="firstname"
                            value={ form.firstname }
                            onChange={(e) => handleFormChange(e.target.value, "firstname")}
                        />
                    </div>
                    <div className='form-label'>
                        <label htmlFor='lastname'>Lastname</label>
                        <InputText
                            name="lastname"
                            value={ form.lastname }
                            onChange={(e) => handleFormChange(e.target.value, "lastname")}
                        />
                    </div>
                    <div className='form-label'>
                        <label htmlFor='email'>Email</label>
                        <InputText
                            name="email"
                            value={ form.email }
                            onChange={(e) => handleFormChange(e.target.value, "email")}
                        />
                    </div>
                    <div className='form-label'>
                        <label htmlFor='account'>Account</label>
                        <Dropdown
                            name="account"
                            aria-describedby="account"
                            value={ form.account }
                            onChange={(e) => handleFormChange(e.value, "account")}
                            options={ accountOptionList }
                            optionValue="code"
                            optionLabel="name"
                            placeholder="Select account type"
                        />
                    </div>
                    <div className='form-label'>
                        <label htmlFor='password'>Password</label>
                        <Password
                            name="password"
                            value={ form.password }
                            onChange={(e) => handleFormChange(e.target.value, "password")}
                            className='form-password-field'
                            toggleMask
                        />
                    </div>
                    <Button
                        label='Register'
                        onClick={() => handleSubmitEvent() }
                    />
                </div>
                <Link to="/login">Login</Link>
                <Toast ref={toast} />
            </div>
        </div>
    )
}