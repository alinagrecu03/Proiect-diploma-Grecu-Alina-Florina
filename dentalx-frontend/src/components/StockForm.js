import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";

// formular pentru modificarea unei marfi
export function UpdateStockForm(props) {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        id: "",
        name: "",
        category: "",
        quantity: 0,
        is_reusable: false,
        doctor_id: "",
        price: 0,
        date_buyed: null
    });
    const categoryList = [{
        code: "CV",
        name: "Cost variabil"
    }, {
        code: "CF",
        name: "Cost fix"
    }]
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "name",
        "category",
        "quantity",
        "doctor_id",
        "price",
        "date_buyed"
    ];
    useEffect(() => {
        if (data) {
            setForm({
                id: data?.id ?? "",
                name: data?.name ?? "",
                category: data?.category ?? "",
                quantity: data?.quantity ?? 0,
                doctor_id: data?.doctor_id ?? "",
                is_reusable: data?.is_reusable ?? false,
                price: data?.price ?? 0,
                date_buyed: data?.date_buyed ? Date(data?.date_buyed ?? null) : null
            });
        }
    }, [data]);
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const handleCancelEvent = () => {
        setForm({
            id: "",
            name: "",
            category: "",
            quantity: 0,
            doctor_id: "",
            is_reusable: false,
            price: 0,
            date_buyed: null
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => !!form?.[errorVal])) {
            submit(form);
            setForm({
                id: "",
                name: "",
                category: "",
                quantity: 0,
                is_reusable: false,
                doctor_id: "",
                price: 0,
                date_buyed: null
            });
            setSubmitEvent(false);
        } else {
            setSubmitEvent(true);
        }
    }
    return (
        <div className="profile-dialog-content full-width">
            <div className='profile-form'>
                <div className='form-label'>
                    <label htmlFor='name'>Name</label>
                    <InputText
                        id="name"
                        aria-describedby="name"
                        value={ form.name }
                        invalid={ submitEvent && !form?.name }
                        onChange={(e) => handleFormChange(e.target.value, "name")}
                    />
                    {
                        submitEvent && !form?.name && (
                            <small id="name" style={{
                                color: "red"
                            }}>
                                Name is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='category'>Category</label>
                    <Dropdown
                        name="category"
                        aria-describedby="category"
                        value={form.category}
                        onChange={(e) => handleFormChange(e.value, "category")}
                        options={categoryList}
                        optionValue="code"
                        optionLabel="name"
                        invalid={ submitEvent && !form?.category }
                        placeholder="Select a category"
                    />
                    {
                        submitEvent && !form?.category && (
                            <small id="category" style={{
                                color: "red"
                            }}>
                                Category is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='quantity'>Quantity</label>
                    <InputNumber
                        id="quantity"
                        aria-describedby="quantity"
                        value={ form.quantity }
                        invalid={ submitEvent && !form?.quantity }
                        onChange={(e) => handleFormChange(e.value, "quantity")}
                    />
                    {
                        submitEvent && !form?.quantity && (
                            <small id="quantity" style={{
                                color: "red"
                            }}>
                                Quantity is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='is_reusable'>Is reusable</label>
                    <Checkbox
                        id="is_reusable"
                        aria-describedby="is_reusable"
                        checked={ form.is_reusable }
                        onChange={(e) => handleFormChange(e.checked, "is_reusable")}
                    />
                </div>
                <div className='form-label'>
                    <label htmlFor='price'>Price</label>
                    <InputNumber
                        id="price"
                        aria-describedby="price"
                        value={ form.price }
                        invalid={ submitEvent && !form?.price }
                        onChange={(e) => handleFormChange(e.value, "price")}
                    />
                    {
                        submitEvent && !form?.price && (
                            <small id="price" style={{
                                color: "red"
                            }}>
                                Price is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='date_buyed'>Date buyed</label>
                    <Calendar
                        id="date_buyed"
                        value={ form.date_buyed }
                        onChange={(e) => handleFormChange(e.value, "date_buyed")}
                        dateFormat="yy-mm-dd"
                        invalid={ submitEvent && !form?.date_buyed }
                    />
                    {
                        submitEvent && !form?.date_buyed && (
                            <small id="date_buyed" style={{
                                color: "red"
                            }}>
                                Date buyed is mandatory
                            </small>
                        )
                    }
                </div>
                <Button label={ labelSubmit ?? "Update" } onClick={() => handleSubmitEvent() } />
                <br />
                {
                    cancel && (
                        <Button label="Cancel" onClick={() => handleCancelEvent() } />
                    )
                }
            </div>
        </div>
    )
}