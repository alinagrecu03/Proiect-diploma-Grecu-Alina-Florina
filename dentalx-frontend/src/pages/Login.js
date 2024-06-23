import React, { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { saveData } from '../utils/requests';
import { useDispatch } from 'react-redux';
import { login } from '../redux/actions/authentication';
import { Link, useNavigate } from 'react-router-dom';
import "../style/Login.css";
import { Toast } from 'primereact/toast';
import { TOAST_LIFE } from '../utils/utils';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function Login() {
    // functie pentru setarea datelor in redux
    const dispatch = useDispatch();
    // functie pentru navigare in aplicatie
    const navigate = useNavigate();
    const toast = useRef(null);
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    // cu acest hook facem operatiunea de login
    const saveMutation = useMutation((data) => saveData(
        "/api/v1/posts/login",
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            // daca contul este inactiv delogam si redirectam catre login
            if (response?.data?.status) {
                // daca contul este activ setam datele in redux si verificam daca contul este doctor si este un cont nou
                // daca este atunci redirectam catre update-profile ca medicul sa-si introduca datele despre studiile medicale
                dispatch(login(response?.data));
                if (response?.data?.new_account && response?.data?.account === "doctor") {
                    navigate("/update-profile");
                } else {
                    // daca contul este unul obisnuit il redirectam catre home pe user
                    navigate("/");
                }
            } else if (response?.error === "Password incorrect!") {
                toast.current.show({severity:'error', summary: 'Error', detail:'Password incorrect!', life: TOAST_LIFE});
            } else if (response?.error === "Email incorrect!") {
                toast.current.show({severity:'error', summary: 'Error', detail:'Email incorrect!', life: TOAST_LIFE});
            } else if (!response?.data?.status) {
                toast.current.show({severity:'warn', summary: 'Warning', detail:'Your account is disabled', life: TOAST_LIFE});
            }
        }
    });
    // functie pentru a seta datele de pe campuri
    const handleFormChange = (value, field) => {
        setForm({
            ...form,
            [field]: value
        });
    };
    // functie care apeleaza hook-ul de mai sus
    const handleSubmitEvent = () => {
        if (form.email && form.password) {
            saveMutation.mutate(form);
        }
    };
    return (
        <div className='Login'>
            <div className='login-info'>
            </div>
            <div className='login-credentials'>
                <div className='profile-form'>
                    <h1>Login</h1>
                    <div className='form-label'>
                        <label htmlFor='email'>Email</label>
                        <InputText
                            name="email"
                            value={ form.email }
                            onChange={(e) => handleFormChange(e.target.value, "email")}
                        />
                    </div>
                    <div className='form-label'>
                        <label htmlFor='password'>Password</label>
                        <Password
                            name="password"
                            value={ form.password }
                            onChange={(e) => handleFormChange(e.target.value, "password")}
                            className='form-password-field'
                            feedback={false}
                            toggleMask
                        />
                    </div>
                    <Button
                        label='Submit'
                        onClick={() => handleSubmitEvent() }
                    />
                </div>
                <Link to="/register">Register</Link>
                <Toast ref={toast} />
            </div>
        </div>
    )
}