import { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis,Tooltip,Brush } from "recharts";

import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const Chart = () => {
  const [timeframe, setTimeframe] = useState("daily");
  const [chartData, setChartData] = useState({
    apiStatus: apiStatusConstants.initial,
    data: [],
  });

  const getChartsData = async () => {
    setChartData({ apiStatus: apiStatusConstants.inProgress });
    const response = await fetch("/data.json");
    if (response.ok) {
      const fetchedData = await response.json();
      setChartData({
        apiStatus: apiStatusConstants.success,
        data: fetchedData,
      });
    } else {
      setChartData({ apiStatus: apiStatusConstants.failure });
    }
  };



  useEffect(() => {
    getChartsData();
  }, []);

  const renderLoaderView = () => <p>Loading...</p>;

  const renderFailureView = () => (
    <button type="button" onClick={getChartsData} className="retry-btn">
      Retry
    </button>
  );

  const renderSuccessView = () => {

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        if (timeframe === 'daily') {
          return date.toLocaleDateString();
        } else if (timeframe === 'weekly' || timeframe === 'monthly') {
          return date.toLocaleDateString();
        }
        return date.toLocaleString();
      };

    const filteredData = chartData.data.filter((eachItem) => {
        const presentDate = new Date(eachItem.timestamp)
        if (timeframe === 'daily'){
            return true;
        }
        else if (timeframe === 'weekly'){
            return presentDate.getDay() === 0;

        }
        else if (timeframe === 'monthly'){
            return presentDate.getDate() === 1;
        }
        return true
    })
   
    const renderLineChart=()=>(
        <ResponsiveContainer height="100%" width="100%">
        <LineChart data={filteredData}>
            <CartesianGrid stroke='#0003' />
            <XAxis dataKey = 'timestamp'  tickFormatter={formatXAxis} />
            <YAxis />
            <Tooltip/>
            <Line type="monotone" dataKey='value' />
            <Brush dataKey='timestamp' height={26}  stroke="#000" />
        </LineChart>
      </ResponsiveContainer>
    )

    const renderButtons = () => (
        <div className='buttons-container'>
            <button className={timeframe === 'daily'? 'active-day-btn' : 'day-btn'} type="button" onClick={() => setTimeframe('daily')} >Daily</button>
            <button className={timeframe === 'weekly'? 'active-day-btn' : 'day-btn'} type="button" onClick={() => setTimeframe('weekly')} >Weekly</button>
            <button className={timeframe === 'monthly'? 'active-day-btn' : 'day-btn'} type="button" onClick={() => setTimeframe('monthly')} >Monthly</button>
        </div>
    )

    return (
      <> 
       {renderButtons()}
       {renderLineChart()}
      </>
    );
  };

  const renderCharts = () => {
    switch (chartData.apiStatus) {
      case apiStatusConstants.inProgress:
        return renderLoaderView();
      case apiStatusConstants.failure:
        return renderFailureView();
      case apiStatusConstants.success:
        return renderSuccessView();
      default:
        return null;
    }
  };

  return <div className="charts-container">{renderCharts()}</div>;
};

export default Chart;
