import { Timeline } from "primereact/timeline";
import React from "react";
import { about_us_steps } from "../utils/utils";
import "../style/AboutUs.css";
import { Card } from "primereact/card";

const AboutUs = () => {
    const customizedMarker = (item) => {
        return (
            <span className="icon-step" style={{ backgroundColor: item.color }}>
                <i className={item.icon}></i>
            </span>
        );
    };

    const customizedContent = (item) => {
        return (
            <Card title={item.status}>
                {
                    item?.carousel ? (
                        item?.carousel?.map((image, index) => (<img key={index} src={require(`../img/${image}.jpg`)} alt={`carousel-${index}`} width={200} className="mr-10" />))
                    ) : item.image ? <img src={require(`../img/${item.image}.jpg`)} alt={item.name} width={200} className="shadow-1" /> : null
                }
                <p className="card-paragraph">{item.description}</p>
            </Card>
        );
    };
    return (
        <div className="Home">
            <Timeline value={about_us_steps} align="alternate" className="customized-timeline" marker={customizedMarker} content={customizedContent} />
        </div>
    );
}

export default AboutUs;