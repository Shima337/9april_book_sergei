/* eslint-disable */
import React from "react";

import "./assets/css/reset.css";
import "./assets/css/main.css";

import Chat from "./components/Chat/Chat";
import useHistoryStore from "./components/utils/stores/useHistoryStore";
import { useEffect } from "react";

function App() {
	const { history } = useHistoryStore();

	useEffect(() => {
		console.log(history);
	}, [history]);

	return (
		<div className="app">
			<Chat />
		</div>
	);
}

export default App;
