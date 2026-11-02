import { createSlice } from "@reduxjs/toolkit";
import { getData, removeData, saveData } from "../../utils/LocalStorage";


const initialState = {
  user: getData("user") || null,
  accessToken: getData("accessToken") || null,
  refreshToken: getData("refreshToken") || null,
  isAuthenticated: !!getData("accessToken"),
};

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        setCredentials : ( state , action ) => {
            const { user, access, refresh } = action.payload;

            state.user = user;
            state.accessToken = access;
            state.refreshToken = refresh;
            state.isAuthenticated = Boolean(access);

            saveData("user", user);
            saveData("accessToken", access);
            saveData("refreshToken", refresh);

            state.token = access;
            saveData("token", access);   

        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.token = null;
            state.isAuthenticated = false;

            removeData("user");
            removeData("accessToken");
            removeData("refreshToken");
            removeData("token");
        },
    },
})


export const { setCredentials , logout } = authSlice.actions;
export default authSlice.reducer;