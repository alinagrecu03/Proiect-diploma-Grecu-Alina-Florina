import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import React, { useEffect, useState } from "react";
import { useGetPatients } from "../utils/utils";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";

// formular pentru adaugarea unui document pdf
export function AddDocumentForm(props) {
    const {
        data,
        isPatient,
        submit,
        cancel
    } = props;
    const userDetails = useSelector(state => state.userDetails.data);
    const patientQuery = useGetPatients(userDetails?.account, userDetails?.userid);
    const patientList = (patientQuery?.data?.data ?? [])
        .map((patient) => ({ code: patient.userid, name: `${patient.firstname}${patient.lastname}` }));
    const [form, setForm] = useState({
        patientid: "",
        documents: ""
    });
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "patientid",
        "documents"
    ];
    useEffect(() => {
        if (data && isPatient) {
            setForm({
                patientid: data?.userid ?? "",
                documents: ""
            })
        }
    }, [data, isPatient]);
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const handleCancelEvent = () => {
        setForm({
            patientid: "",
            documents: ""
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => !!form?.[errorVal])) {
            submit(form);
            setForm({
                patientid: "",
                documents: ""
            });
            setSubmitEvent(false);
        } else {
            setSubmitEvent(true);
        }
    }
    return (
        <div className="profile-dialog-content full-width">
            <div className='profile-form'>
                {
                    !isPatient && (
                        <div className='form-label'>
                            <label
                                htmlFor='patientid'
                                style={{
                                    color: submitEvent && !form?.patientid ? "red" : "black"
                                }}
                            >Patient</label>
                            <Dropdown
                                name="patientid"
                                aria-describedby="patientid"
                                value={form.patientid}
                                onChange={(e) => handleFormChange(e.value, "patientid")}
                                options={patientList}
                                optionValue="code"
                                optionLabel="name"
                                invalid={ submitEvent && !form?.patientid }
                                placeholder="Select a patient"
                            />
                            {
                                submitEvent && !form?.patientid && (
                                    <small
                                        id="patientid"
                                        style={{
                                            color: "red"
                                        }}
                                    >
                                        Select a patient
                                    </small>
                                )
                            }
                        </div>
                    )
                }
                <div className='form-label'>
                    <label
                        htmlFor='documents'
                        style={{
                            color: submitEvent && !form?.documents ? "red" : "black"
                        }}
                    >Upload a file</label>
                    <FileUpload
                        name="documents" 
                        mode="advanced"
                        value={ form?.documents }
                        chooseOptions={{label:"Select File", icon:"pi pi-plus", className:'icon-btn'}}
                        auto
                        customUpload="true"
                        uploadHandler={(e) => handleFormChange(e?.files?.[0], "documents") }
                        multiple={false}
                        accept="file/*" 
                        emptyTemplate={<p className="m-0">Please select a file from disk.</p>} 
                    />
                    {
                        submitEvent && !form?.documents && (
                            <small
                                id="documents"
                                style={{
                                    color: "red"
                                }}
                            >
                                Select a file
                            </small>
                        )
                    }
                </div>
                <Button label="Add" onClick={() => handleSubmitEvent() } />
                <br />
                <Button label="Cancel" onClick={() => handleCancelEvent() } />
            </div>
        </div>
    );
}