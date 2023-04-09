import React from "react";

import "./Chat.css";

import PromtInput from "../PromtInput/PromtInput";
import Dialog from "../Dialog/Dialog";

const Chat = () => {
	return (
		<div className="chat">
			<Dialog />
			<PromtInput />
		</div>
	);
};

export default Chat;
