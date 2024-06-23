import React from "react";
import "../style/Orders.css";
import { OrdersTable } from "../components/OrdersTable";

export default function Orders() {
    return (
        <div className="Orders">
            <OrdersTable />
        </div>
    );
}