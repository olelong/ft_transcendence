//import { useState } from "react";
//import { useEffect } from "react";
//import Tab from "react-bootstrap/Tab";

//import Tabs from "react-bootstrap/Tabs";

import "../styles/Achievements.css";

export default function ProfileLists() {
    const achievements = () => {
        return (<p>hello</p>);
    };

    const blocked = () => {<p>world</p>};

    const history = () => {<p>hey</p>};

    return ( { achievements, blocked, history } 
        /*<Tabs className="tabs">
            <Tab> title="Achievements" className="tab"
                { achievements }
            </Tab>
            <Tab> title="History Games" className="tab"
                { history }
            </Tab>
            <Tab> title="Friends Blocked" className="tab"
                { blocked }
            </Tab>
        </Tabs>*/
    );
}