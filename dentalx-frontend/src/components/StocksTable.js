import React, { useRef, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button";
import Dialog from "./Dialog";
import { UpdateStockForm } from "./StockForm";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { useGetStocks, TOAST_LIFE } from "../utils/utils";
import { useMutation, useQueryClient } from "react-query";
import { saveData, putData, deleteData } from "../utils/requests";

export function StockTable(props) {
    const toast = useRef(null);
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    // aducem stocul de marfa in functie de id-ul userului conectat
    const stocksData = useGetStocks(userDetails?.userid);
    // in selectedRow salvam linia din tabel pentru care se face update/delete
    const [selectedRow, setSelectedRow] = useState(null);
    const queryClient = useQueryClient();
    const [newStock, setNewStock] = useState(false);
    // hook pentru a realiza operatiunea de update/adaugare marfa
    const stockMutation = useMutation((data) => !!data?.id
        ? putData(
            `/api/v1/put/stock/${data?.id}`,
            {
                credentials: "include"
            },
            data
        )
        : saveData(
            "/api/v1/posts/stock",
            {
                credentials: "include"
            },
            data
    ), {
        onSuccess: (response) => {
            // invalidam lista de marfa ca sa aducem noile modificari
            queryClient.invalidateQueries(`${userDetails?.userid}-stocks-list`);
            // afisam mesaj de succes
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // hook pentru a sterge o linie din tabelul de marfa
    const deleteMutation = useMutation((data) => deleteData(
        `/api/v1/delete/stock/${data.id}`,
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            // invalidam lista de marfa ca sa aducem noile modificari
            queryClient.invalidateQueries(`${userDetails?.userid}-stocks-list`);
            // afisam mesaj de succes
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            // afisam mesaj de eroare
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie pentru a seta linia care trebuie modificata
    const handleOnUpdateDialog = (dataRow) => {
        setSelectedRow(dataRow);
    };
    // functie pentru a reseta variabilele
    const handleOnCancelStock = () => {
        setSelectedRow(null);
        setNewStock(false);
    };
    // functie din dialog care apeleaza hook-ul de mai sus
    const handleOnUpdateStock = (data) => {
        stockMutation.mutate(data);
        handleOnCancelStock();
    };
    // functie care apeleaza hook-ul de mai sus
    const handleOnDeleteStock = (data) => {
        deleteMutation.mutate(data);
    };
    // functie pentru a afisa categoria de marfa pentru fiecare linie
    const bodyCategory = (dataRow) => {
        return (
            <p>{ dataRow?.category === "CV" ? "Cost variabil" : "Cost fix" }</p>
        )
    };
    // functie pentru a afisa daca marfa este reutilizabila sau nu
    const bodyIsReusable = (dataRow) => {
        return (
            dataRow?.is_reusable ? "Yes" : "No"
        )
    };
    // functie pentru a afisa data cand a fost realizata achizitia pentru fiecare linie
    const bodyDate = (dataRow) => {
        return dataRow?.date_buyed ? new Date(dataRow?.date_buyed ?? null)?.toLocaleDateString("en-GB") : "";
    };
    // functie pentru a afisa tipurile de actiuni pentru fiecare linie
    const actionsBtn = (dataRow) => {
        return (
            <div>
                <Button label="Update" className="mr-10" onClick={ () => handleOnUpdateDialog(dataRow) } />
                <Button label="Delete" onClick={ () => handleOnDeleteStock(dataRow) } />
            </div>
        )
    };
    // functie pentru initializarea dialogului cand se adauga un stock de marfa nou
    const handleOnOpenDialog = () => {
        setSelectedRow({
            name: "",
            category: "",
            quantity: 0,
            is_reusable: false,
            doctor_id: userDetails?.userid,
            price: 0,
            date_buyed: null
        });
        setNewStock(true);
    };
    // functionalitatea asta este vizibila doar pentru medic
    return (
        <>
            <Button label="Add Stocks" className='my-10' onClick={() => handleOnOpenDialog() } />
            <DataTable
                // folosim rows si paginator pentru a afisa partea de paginatii la tabel, daca depaseste 7 linii in tabel
                // apare paginatia
                rows={7}
                paginator={ stocksData?.data?.data?.length > 7 ? true : false }
                value={stocksData?.data?.data ?? []}
            >
                <Column field="name" header="Name"></Column>
                <Column field="category" header="Category" body={ bodyCategory }></Column>
                <Column field="quantity" header="Quantity"></Column>
                <Column field="is_reusable" header="Is reusable" body={ bodyIsReusable }></Column>
                <Column field="price" header="Price"></Column>
                <Column field="date_buyed" header="Date buyed" body={ bodyDate }></Column>
                <Column header="Actions" body={ actionsBtn }></Column>
            </DataTable>
            <Dialog
                header={() => <h3>{ newStock ? "Create stock" : "Update stock" }</h3>}
                visible={ !!selectedRow }
                onHide={ handleOnCancelStock }
            >
                <UpdateStockForm
                    data={ selectedRow }
                    labelSubmit={ newStock ? "Create stock" : "Update stock" }
                    submit={ handleOnUpdateStock }
                    cancel={ handleOnCancelStock }
                />
            </Dialog>
            <Toast ref={toast} />
        </>
    );
}