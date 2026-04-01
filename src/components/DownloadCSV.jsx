import React, { useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";

import "../styles/DownloadCSV.scss";
import axios from "axios";
import { BACKEND_BASE_URL } from "../config/constants";

const DownloadCSV = () => {
    const [csvData, setCSVData] = useState("");

    const handleDownload = () => {
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "data.csv";
        link.click();
    };

    const fetchDataFromFirestore = async () => {
        try {            
            const { data } = await axios.get(`${BACKEND_BASE_URL}/contacts/csv`);
            setCSVData(data.csvData)
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    return (
        <div>
            <button onClick={fetchDataFromFirestore}>
                <AiOutlineCloudDownload />
            </button>
            {csvData && (
                <button onClick={handleDownload}>
                    <IoMdDownload />
                </button>
            )}
        </div>
    );
};

export default DownloadCSV;
