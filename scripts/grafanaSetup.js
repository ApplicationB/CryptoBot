require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
// Grafana API details from .env file
const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:3000';
const grafanaApiKey = process.env.GRAFANA_API_KEY;
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const quickurln = process.env.QUICKNODE_URL;

// Replace these addresses with your deployed contract addresses
//const mainBotAddress = '0xYourMainBotAddress'; // MainBot contract address
//const controllerAddress = '0xYourControllerAddress'; // Controller contract address

async function createDataSource() {
    const dataSourceConfig = {
        name: 'Ethereum',
        type: 'grafana-ethereum-datasource',
        access: 'proxy',
        url: quickurln, // Replace with your Ethereum node URL
        basicAuth: false,
        withCredentials: false,
        isDefault: true,
        jsonData: {
            network: 'mainnet',
        },
    };

    try {
        const response = await axios.post(`${grafanaUrl}/api/datasources`, dataSourceConfig, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${grafanaApiKey}`,
            },
        });
        console.log('Data source created:', response.data);
    } catch (error) {
        console.error('Error creating data source:', error.response ? error.response.data : error.message);
    }
}

async function createDashboard() {
    const dashboardConfig = {
        dashboard: {
            title: 'Ethereum Smart Contracts Dashboard',
            panels: [
                {
                    title: 'Smart Contract Balances',
                    type: 'graph',
                    datasource: 'Ethereum',
                    targets: [
                        {
                            target: `balance{address="${mainBotAddress}"}`,
                        },
                        {
                            target: `balance{address="${controllerAddress}"}`,
                        },
                    ],
                },
                {
                    title: 'Smart Contract Prices',
                    type: 'graph',
                    datasource: 'Ethereum',
                    targets: [
                        {
                            target: `price{address="${mainBotAddress}"}`,
                        },
                    ],
                },
            ],
        },
        overwrite: true,
    };

    try {
        const response = await axios.post(`${grafanaUrl}/api/dashboards/db`, dashboardConfig, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${grafanaApiKey}`,
            },
        });
        console.log('Dashboard created:', response.data);
    } catch (error) {
        console.error('Error creating dashboard:', error.response ? error.response.data : error.message);
    }
}

// Example usage
(async () => {
    await createDataSource();
    await createDashboard();
})();
