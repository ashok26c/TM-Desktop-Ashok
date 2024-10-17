import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import axios from 'axios';

import working from '../assets/image/productive.png';
import total from '../assets/image/productive1.png';
import productive from '../assets/image/growth.png';
import { BaseApiURL } from '../context/ApiURL';

export function AppDetail() {
    const token = localStorage.getItem('sessionToken');
    const [appDetail, setAppDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const app_detail_api = `${BaseApiURL}/app/productive-apps`;

    const fetchAppDetail = async () => {
        try {
            const response = await axios.get(app_detail_api, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
          
            setAppDetail(response.data);
        } catch (error) {
            console.error('Error while fetching data', error);
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppDetail();
    }, []);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    if (!appDetail) return <Typography>No data available</Typography>;

    return (
        <Box sx={{ paddingTop: '40px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>App Details</h3>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px', height: '17vh' }}>
                <Box key="app-details" sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#D2DAFF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <Box sx={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Productive used App in %
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {appDetail.productiveAppsPercentage || '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={productive} alt='Productive' />
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#D2DAFF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <Box sx={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Productive Used App
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {appDetail.totalAppsUsed || '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={working} alt='Working' />
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#D2DAFF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <Box sx={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Total Used App
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {appDetail.productiveAppsUsed || '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={total} alt='Total' />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
