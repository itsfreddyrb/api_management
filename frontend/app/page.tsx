"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Define types for API and Database objects
type API = {
    id: number;
    path: string;
    method: string;
    sqlQuery: string;
    tokenProtected: boolean;
    testResult?: string; // Optional field to store the rxesult of the API test
    databaseId: number | null;  // ✅ Expect `databaseId` instead of `database`
};

type Database = {
    id: number;
    name: string;
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    dbName: string;
};

export default function Home() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [apis, setApis] = useState<API[]>([]);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [totalHits, setTotalHits] = useState(0);

    // Form state
    const [path, setPath] = useState("");
    const [method, setMethod] = useState("GET");
    const [sqlQuery, setSqlQuery] = useState("");
    const [tokenProtected, setTokenProtected] = useState(false);
    const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(null);

    // Database creation form states
    const [newDbName, setNewDbName] = useState("");
    const [newDbType, setNewDbType] = useState("MySQL");
    const [newDbHost, setNewDbHost] = useState("");
    const [newDbPort, setNewDbPort] = useState<number>(3306);
    const [newDbUsername, setNewDbUsername] = useState("");
    const [newDbPassword, setNewDbPassword] = useState("");
    const [newDbDbName, setNewDbDbName] = useState("");

    const API_BASE_URL = "http://localhost:3001"; // Backend URL

    // Fetch APIs and Databases on load
    useEffect(() => {
        const fetchApis = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/list`);
                setApis(response.data);
            } catch (error) {
                console.error("Failed to fetch APIs:", error);
            }
        };

        const fetchDatabases = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/databases`);
                setDatabases(response.data);
            } catch (error) {
                console.error("Failed to fetch databases:", error);
            }
        };

        fetchApis();
        fetchDatabases();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [apis]); // Recalculate when APIs update

    // Dashboard stats
    const calculateStats = () => {
        const total = apis.reduce((acc, api) => acc + api.hits, 0);
        setTotalHits(total);
    };

    const createApi = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission behavior

        if (selectedDatabaseId === null) {
            alert("Please select a database.");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/create`, {
                path,
                method,
                sqlQuery,
                tokenProtected,
                databaseId: selectedDatabaseId,
            });

            console.log("✅ API Creation Response:", response.data);

            if (response.data.success) {
                alert("API Created!");
                const updatedResponse = await axios.get(`${API_BASE_URL}/api/list`);
                setApis(updatedResponse.data);
            } else {
                alert("API creation failed. Unexpected response status.");
            }
        } catch (error) {
            console.error("🚨 Axios Error:", error);
            alert("Failed to create API. Check console for details.");
        }
    };

    const testApi = async (apiId: number) => {
        const api = apis.find((api) => api.id === apiId);
        if (!api) {
            alert("API not found");
            return;
        }

        if (!api.databaseId) {
            console.error("🚨 ERROR: API missing databaseId:", api);
            alert("API is missing its database reference.");
            return;
        }

        console.log("🚨 DEBUG: Testing API", api);
        console.log("🚨 DEBUG: Selected Database ID", api.databaseId);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/test`, {
                databaseId: api.databaseId,
                sqlQuery: api.sqlQuery,
            });

            await axios.post(`${API_BASE_URL}/api/update-hits`, { apiId });

            // ✅ Manually update hits in the UI
            setApis((prevApis) =>
                prevApis.map((apiItem) =>
                    apiItem.id === apiId
                        ? { ...apiItem, hits: apiItem.hits + 1, testResult: JSON.stringify(response.data, null, 2) }
                        : apiItem
                )
            );

            // ✅ Recalculate total hits immediately
            setTotalHits((prevTotal) => prevTotal + 1);

        } catch (error) {
            console.error("🚨 ERROR testing API:", error);
            alert("Failed to test API. Check console.");
        }
    };

    // Handle database creation
    const createDatabase = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the form from reloading the page

        try {
            await axios.post(`${API_BASE_URL}/api/create-database`, {
                name: newDbName,
                type: newDbType,
                host: newDbHost,
                port: newDbPort,
                username: newDbUsername,
                password: newDbPassword,
                dbName: newDbDbName,
            });

            alert("Database Created!");
            const response = await axios.get(`${API_BASE_URL}/databases`);
            setDatabases(response.data);
        } catch (error) {
            console.error("Error creating database:", error);
            alert("Failed to create database. Check console.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">API MANAGEMENT</h1>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <nav className="w-1/4 bg-gray-200 p-4">
                    <ul className="space-y-4">
                        <li>
                            <button
                                className={`w-full py-2 px-4 ${activeTab === "dashboard" ? "bg-blue-500" : "bg-blue-400"} text-white rounded`}
                                onClick={() => setActiveTab("dashboard")}
                            >
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full py-2 px-4 ${activeTab === "createApi" ? "bg-blue-500" : "bg-blue-400"} text-white rounded`}
                                onClick={() => setActiveTab("createApi")}
                            >
                                Create API Endpoint
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full py-2 px-4 ${activeTab === "createDatabase" ? "bg-blue-500" : "bg-blue-400"} text-white rounded`}
                                onClick={() => setActiveTab("createDatabase")}
                            >
                                Create Database
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full py-2 px-4 ${activeTab === "listApi" ? "bg-blue-500" : "bg-blue-400"} text-white rounded`}
                                onClick={() => setActiveTab("listApi")}
                            >
                                List API Endpoints
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full py-2 px-4 ${activeTab === "listDatabases" ? "bg-blue-500" : "bg-blue-400"} text-white rounded`}
                                onClick={() => setActiveTab("listDatabases")}
                            >
                                List Databases
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Dashboard */}
                    {activeTab === "dashboard" && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* API Endpoints Card */}
                                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">API Endpoints</h3>
                                        <p className="text-2xl font-bold text-gray-900">{apis.length}</p>
                                    </div>
                                    <div className="text-blue-500 text-4xl">
                                        <i className="fas fa-cogs"></i>
                                    </div>
                                </div>

                                {/* Databases Card */}
                                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Databases</h3>
                                        <p className="text-2xl font-bold text-gray-900">{databases.length}</p>
                                    </div>
                                    <div className="text-green-500 text-4xl">
                                        <i className="fas fa-database"></i>
                                    </div>
                                </div>

                                {/* Hits Card */}
                                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Total Hits</h3>
                                        <p className="text-2xl font-bold text-gray-900">{totalHits}</p>
                                    </div>
                                    <div className="text-orange-500 text-4xl">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Create API Form */}
                    {activeTab === "createApi" && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold mb-4">Create API</h2>
                            <form onSubmit={createApi}>
                                <input
                                    type="text"
                                    placeholder="API Path"
                                    value={path}
                                    onChange={(e) => setPath(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                >
                                    <option>GET</option>
                                    <option>POST</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="SQL Query"
                                    value={sqlQuery}
                                    onChange={(e) => setSqlQuery(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <label className="block mb-2">
                                    <input
                                        type="checkbox"
                                        checked={tokenProtected}
                                        onChange={() => setTokenProtected(!tokenProtected)}
                                        className="mr-2"
                                    />
                                    Token Protected
                                </label>
                                <select
                                    value={selectedDatabaseId ?? ""}
                                    onChange={(e) => setSelectedDatabaseId(Number(e.target.value))}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                >
                                    <option value="">Select Database</option>
                                    {databases.map((db) => (
                                        <option key={db.id} value={db.id}>
                                            {db.name}
                                        </option>
                                    ))}
                                </select>
                                <button className="w-full py-2 px-4 bg-blue-500 text-white rounded">
                                    Create API
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Create Database Form */}
                    {activeTab === "createDatabase" && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold mb-4">Create Database</h2>
                            <form onSubmit={createDatabase}>
                                <input
                                    type="text"
                                    placeholder="Database Name"
                                    value={newDbName}
                                    onChange={(e) => setNewDbName(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <select
                                    value={newDbType}
                                    onChange={(e) => setNewDbType(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                >
                                    <option value="MySQL">MySQL</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Host"
                                    value={newDbHost}
                                    onChange={(e) => setNewDbHost(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <input
                                    type="number"
                                    placeholder="Port"
                                    value={newDbPort}
                                    onChange={(e) => setNewDbPort(Number(e.target.value))}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newDbUsername}
                                    onChange={(e) => setNewDbUsername(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newDbPassword}
                                    onChange={(e) => setNewDbPassword(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="Database Name"
                                    value={newDbDbName}
                                    onChange={(e) => setNewDbDbName(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-blue-500 text-white rounded"
                                >
                                    Create Database
                                </button>
                            </form>
                        </section>
                    )}

                    {/* List of Existing APIs */}
                    {activeTab === "listApi" && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold mb-4">Existing APIs</h2>
                            <ul>
                                {apis.length === 0 ? (
                                    <li>No APIs found</li>
                                ) : (
                                    apis.map((api) => (
                                        <li key={api.id}>
                                            <strong>Path:</strong> {api.path}, <strong>Method:</strong> {api.method},
                                            <strong>SQL:</strong> {api.sqlQuery}, <strong>Protected:</strong> {api.tokenProtected ? "Yes" : "No"}
                                            <strong>Hits:</strong> {api.hits}  {/* ✅ Show hits here */}
                                            <button onClick={() => testApi(api.id)}>Test API</button>
                                            {api.testResult && (
                                                <div>
                                                    <h3>Test Result</h3>
                                                    <pre>{api.testResult}</pre>
                                                </div>
                                            )}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>
                    )}

                    {/* List of Existing Databases */}
                    {activeTab === "listDatabases" && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold mb-4">Existing Databases</h2>
                            <ul>
                                {databases.length === 0 ? (
                                    <li>No databases found</li>
                                ) : (
                                    databases.map((db) => (
                                        <li key={db.id}>
                                            <strong>{db.name}</strong> ({db.type}) - {db.host}:{db.port}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}