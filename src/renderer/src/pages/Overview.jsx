import React from 'react';
import Divider from "@mui/material/Divider";
import Bar from '../components/Bar';
import { OverviewModal } from '../model/OverviewModal';
import { AppDetail } from "../components/appdetail";

export function Overview() {
    return (
        <div className="right-content" style={{ height: "100vh", width: "84vw", display: 'flex', flexDirection: 'column' }}>
            {/* <Bar /> */}
            <OverviewModal />
            <Divider />
            <AppDetail />
        </div>
    );
}

