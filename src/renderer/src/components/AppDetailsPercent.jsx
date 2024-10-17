import axios from "axios";
import { useEffect, useState } from "react";
import { BaseApiURL } from "../context/ApiURL";
import { useTracking } from "../context/GlobleTracking";
import { Box, Card, CardContent, Typography } from "@mui/material";
import working from '../assets/image/productive.png';
import total from '../assets/image/productive1.png';
import productive from '../assets/image/growth.png';
import { useDispatch } from "react-redux";
import { addAppReview } from "../redux/appReview/appReviewSlice";

const AppDetailsPercent = () => {
  const token = localStorage.getItem("sessionToken");
  const dispatch = useDispatch()
  const [reviewedApps, setReviewedApps] = useState([]);

  const [totalAppsUsed, setTotalAppsUsed] = useState(0);
  const [unproductiveAppsUsed, setUnproductiveAppsUsed] = useState(0);
  const [productiveAppsUsed, setProductiveAppsUsed] = useState(0);
  const [productiveAppsPercentage, setProductiveAppsPercentage] = useState(0);

  const { appDurations } = useTracking();

  const fetchReviewedApps = async () => {
    try {
      const response = await axios.get(`${BaseApiURL}/app/reviewed-apps`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setReviewedApps(response.data.reviewedApps);
      dispatch(addAppReview(response.data.reviewedApps))
    } catch (error) {
      console.error("Error while fetching data", error);
    }
  };

  useEffect(() => {
    fetchReviewedApps();
  }, []);

  useEffect(() => {
    // Total number of unique apps used by the employee
    const employeeApps = Object.keys(appDurations);
    setTotalAppsUsed(employeeApps.length);

    // Filter productive apps
    const productiveApps = reviewedApps
      .filter((app) => app.appReview === "PRODUCTIVE")
      .map((app) => app.appName);

    // filter unproductive apps

    const productiveAppsCount = employeeApps.filter((app) =>
      productiveApps.includes(app)
    ).length;
    setProductiveAppsUsed(productiveAppsCount);

    const unproductiveApps = reviewedApps.filter((app)=> app.appReview == "UNPRODUCTIVE").map((app)=>app.appName)
    const unproductiveAppsCount = employeeApps.filter((app)=> unproductiveApps.includes(app)).length;
    setUnproductiveAppsUsed(unproductiveAppsCount)

    // Calculate productive apps percentage
    const percentage =
      employeeApps.length > 0
        ? (productiveAppsCount / employeeApps.length) * 100
        : 0;
    setProductiveAppsPercentage(percentage.toFixed(2));
  }, [appDurations, reviewedApps]);

  return (
    <div>
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
                                    {productiveAppsPercentage} %
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
                                    {productiveAppsUsed}
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
                                    {totalAppsUsed}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={total} alt='Total' />
                            </Box>
                        </CardContent>
                    </Card>
                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#D2DAFF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <Box sx={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Unproductive Apps Used
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {unproductiveAppsUsed}
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
    </div>
  );
};

export default AppDetailsPercent;
