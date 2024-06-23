import React, { useRef, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button";
import Dialog from "./Dialog";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { TOAST_LIFE, event_type, useGetOrders, useGetStocks } from "../utils/utils";
import { useMutation, useQueryClient } from "react-query";
import { saveData, deleteData } from "../utils/requests";
import { UpdateOrderForm } from "./OrderForm";

export function OrdersTable(props) {
    const toast = useRef(null);
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    // aducem lista de comenzi in functie de id-ul si tipul de cont al userului conectat
    const ordersData = useGetOrders(userDetails?.account, userDetails?.userid);
    // aducem lista stocului de marfa in functie de id-ul si tipul de cont al userului conectat
    const stocksData = useGetStocks(userDetails?.account === "patient" ? userDetails?.doctorid : userDetails?.userid);
    const stockList = stocksData?.data?.data?.map((stock) => ({ code: stock.id, name: stock.name }));
    // in selectedRow salvam linia din tabel
    const [selectedRow, setSelectedRow] = useState(null);
    // salvam in aceasta variabila datele de pe un rand selectat, adica cand apasam pe butonul de expandare
    const [expandedRows, setExpandedRows] = useState([]);
    // functie care se apeleaza cand se expandeaza o linie
    const onRowExpand = (dataRow) => {
        setExpandedRows(dataRow);
    };
    const queryClient = useQueryClient();
    // hook pentru salvarea unei comenzi
    const stockMutation = useMutation((data) => saveData(
            "/api/v1/posts/order",
            {
                credentials: "include"
            },
            data
    ), {
        onSuccess: (response) => {
            // invalidam lista ca sa aducem noile modificari
            queryClient.invalidateQueries(`${userDetails?.userid}-orders-list`);
            // afisam mesaj de succes
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // hook ca sa stergem o comanda
    const deleteMutation = useMutation((data) => deleteData(
        `/api/v1/delete/order/${data.id}`,
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            // invalidam lista ca sa aducem noile modificari
            queryClient.invalidateQueries(`${userDetails?.userid}-orders-list`);
            // afisam mesaj de succes
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie pentru a reseta variabilele
    const handleOnCancelOrder = () => {
        setSelectedRow(null);
    };
    // functie din dialog care apeleaza hook-ul de mai sus
    const handleOnUpdateStock = (data) => {
        stockMutation.mutate(data);
        handleOnCancelOrder();
    };
    // functie care apeleaza hook-ul de mai sus
    const handleOnDeleteOrder = (data) => {
        deleteMutation.mutate(data);
    };
    // functie pentru a afisa tipul de comanda efectuat pentru fiecare linie
    const bodyOrderType = (dataRow) => {
        return (
            <p>{ event_type?.find(eventTyp => eventTyp?.code === dataRow?.order_type)?.name ?? "" }</p>
        )
    };
    // functie pentru afisarea datei calendaristice in formatul dorit pentru fiecare linie
    const bodyDate = (dataRow) => {
        return dataRow?.date ? new Date(dataRow?.date ?? null)?.toLocaleDateString("en-GB") : "";
    };
    // functie pentru afisarea tipurilor de actiuni pentru fiecare linie
    const actionsBtn = (dataRow) => {
        return (
            <div>
                <Button label="Delete" onClick={ () => handleOnDeleteOrder(dataRow) } />
            </div>
        )
    };
    // functie pentru initializarea dialogului
    const handleOnOpenDialog = () => {
        setSelectedRow({
            id: "",
            details: "",
            order_type: "",
            total_price: 0,
            costs_used: {},
            date: undefined,
            doctor: userDetails?.userid,
            patient: ""
        });
    };
    // template de ce sa se afiseze cand se expandeaza o linie
    const rowExpansionTemplate = (dataRow) => {
        return (
                <div className="row-template">
                    <div className='row-cell-1'>
                        <h3>Stock used</h3>
                        <DataTable
                            rows={7}
                            paginator={ Object.keys(dataRow?.costs_used ?? {}).map((costKey) => ({ costKey: stockList?.find(stock => stock?.code === costKey)?.name, quantity: dataRow?.costs_used?.[costKey] ?? 0 }))?.length > 7 ? true : false }
                            value={Object.keys(dataRow?.costs_used ?? {}).map((costKey) => ({ costKey: stockList?.find(stock => stock?.code === costKey)?.name, quantity: dataRow?.costs_used?.[costKey] ?? 0 })) ?? []}
                        >
                            <Column
                                field="costKey"
                                header="Product"
                            ></Column>
                            <Column
                                field="quantity"
                                header="Quantity"
                            ></Column>
                        </DataTable>
                    </div>
                </div>
        );
    };
    // aceasta functionalitate este vizibila pentru medic si pacienti
    return (
        <>
            {
                userDetails?.account === "doctor" && (<Button label="Add Invoice" className="my-10" onClick={() => handleOnOpenDialog() } /> )
            }
            <DataTable
                rows={7}
                paginator={ ordersData?.data?.data?.length > 7 ? true : false }
                value={ordersData?.data?.data ?? []}
                expandedRows={ expandedRows }
                rowExpansionTemplate={ (dataRow) => rowExpansionTemplate(dataRow) }
                onRowToggle={ (event) => onRowExpand(event.data) }
            >
                <Column header="Expand" expander></Column>
                <Column field="details" header="Details"></Column>
                <Column field="order_type" header="Type" body={ bodyOrderType }></Column>
                <Column field="total_price" header="Total price"></Column>
                {
                    userDetails?.account === "doctor" ? (
                        <Column field="patient_name" header="Patient name"></Column>
                    ) : (
                        <Column field="doctor_name" header="Doctor name"></Column>
                    )
                }
                <Column field="date" header="Date ordered" body={ bodyDate }></Column>
                {
                    userDetails?.account === "doctor" && (
                        <Column header="Actions" body={ actionsBtn }></Column>
                    )
                }
            </DataTable>
            <Dialog
                header={() => <h3>{ "Create Invoice" }</h3>}
                visible={ !!selectedRow }
                onHide={ handleOnCancelOrder }
            >
                <UpdateOrderForm
                    data={ selectedRow }
                    labelSubmit={ "Create Invoice" }
                    submit={ handleOnUpdateStock }
                    cancel={ handleOnCancelOrder }
                />
            </Dialog>
            <Toast ref={toast} />
        </>
    );
}