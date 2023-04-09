import React from "react";
import "./Message.css";

const Message = (props) => {
	const { item } = props;

	return (
		<div className={`message ${item.role}`}>
			<div className="logo">
				<span>{item.role === "user" ? "U" : "A"}</span>
			</div>
			<div className="content">
				<p>{item.message}</p>
			</div>
		</div>
	);
};

export default Message;
