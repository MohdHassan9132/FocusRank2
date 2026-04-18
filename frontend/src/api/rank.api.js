// frontend/src/api/rank.api.js

import API from "./axios.js";

export const fetchRankings = async (period) => {
  try {
    let endpoint = "";
    
    switch (period.toLowerCase()) {
      case "daily":
        endpoint = "/rank/daily";
        break;
      case "weekly":
        endpoint = "/rank/weekly";
        break;
      case "all time":
        endpoint = "/rank/monthly";
        break;
      default:
        endpoint = "/rank/weekly";
    }
    
    const response = await API.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${period} rankings:`, error);
    throw error;
  }
};