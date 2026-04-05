import React, { useEffect } from "react";
import DonationForm from "../components/Donate/DonationForm/DonateForm";

const DonationFormPage = () => {
    useEffect(() => {
        // Scroll to the top of the page when the component mounts
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white py-8">

            <DonationForm />
        </div>
    );
};

export default DonationFormPage;