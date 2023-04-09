import axios from "axios";
import settings from "../../../settings";

export const requestToGPT = async (message) => {
	const res = await axios.post(
		`${settings.baseUrl}/addNew`,
		{
			question: message,
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	return res;
};

export default requestToGPT;
