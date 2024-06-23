import React from 'react';
import { useSelector } from 'react-redux';
import "../style/Home.css";
import HomePatDoc from '../components/HomePatDoc';
import HomeAdmin from '../components/HomeAdmin';
import AboutUs from './AboutUs';

export default function Home() {
    const userDetails = useSelector(state => state.userDetails.data);
    
    return (
        <div className='Home'>
            {
                userDetails?.account === "admin" ?
                    <HomeAdmin />
                :
                userDetails?.account === "patient" ?
                    <AboutUs />
                :
                    <HomePatDoc />
            }

        </div>
    )
}