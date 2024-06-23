import React from "react";
import "../style/Stock.css";
import { StockTable } from "../components/StocksTable";

export default function Stock() {
    return (
        <div className="Stock">
            <StockTable />
        </div>
    );
}