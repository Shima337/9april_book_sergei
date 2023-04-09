import React from "react";
import axios from "axios";

//import { useWhisper } from "@chengsokdara/use-whisper";

import { useWhisper } from "../../libs/use-whisper/useWhisper.ts";

import "./PromtInput.css";
import "../../assets/css/reset.css";
import "../../assets/css/vars.css";

import useHistoryStore from "../utils/stores/useHistoryStore";
import { requestToGPT } from "../utils/functions/functions.js";
import settings from "../../settings";

const PromtInput = () => {
  const [text, setText] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [eventSource, setEventSource] = React.useState(null);
  const [isTextUpdating, setIsTextUpdating] = React.useState(false);
  const [sentences, setSentences] = React.useState([]);

  React.useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  React.useEffect(() => {
    console.log(sentences);
    speechSynthesis.speak(new SpeechSynthesisUtterance(sentences));
  }, [sentences]);

  const clickHandler = () => {
    let part = "";
    if (eventSource) {
      setText("");
      eventSource.close();
    }

    const newEventSource = new EventSource(
      `http://127.0.0.1:5001/nicotest-55af5/us-central1/test/stream?promt=${inputValue}`
    );

    newEventSource.onmessage = (event) => {
      setText((prevText) => prevText + event.data);
      if (event.data !== ".") {
        part += event.data;
      }
      if (event.data === ".") {
        setSentences(...sentences, part);
        part = "";
      }
    };

    setEventSource(newEventSource);
  };

  return (
    <div>
      <input
        type="text"
        onChange={(e) => setInputValue(e.target.value)}
        style={{ width: "100%" }}
      />
      <button onClick={() => clickHandler()}>Get resp</button>
      <div className="message">{text}</div>
      {/* <div>
				sentence:
				<ul>
					{sentences.map((item) => (
						<li key={item.id}>{item}</li>
					))}
				</ul>
			</div> */}
    </div>
  );
};

export default PromtInput;
