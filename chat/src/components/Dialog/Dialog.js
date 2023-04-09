import React from "react";
import Message from "../Message/Message";

import "./Dialog.css";

import useHistoryStore from "../utils/stores/useHistoryStore";

const Dialog = () => {
	const { history } = useHistoryStore();

	return (
		<div className="dialog">
			{history.map((item) => (
				<Message item={item} key={item.id} />
			))}
		</div>
	);
};

export default Dialog;
