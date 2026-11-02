import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, getCurrentUser } from "../services/authService";
import { logout, setCredentials } from "../redux/slice/authSlice";



export default function useAuth () {
    const dispatch = useDispatch();

    const { user, accessToken, isAuthenticated } = useSelector(
        (state) => state.auth,
    );


    const Login = async (credentials) => {
        // try {
        //     console.log("in the login useAuth hook")
        //     const data = await loginUser(credentials);
        //     dispatch(setCredentials(data));
        //     return data.user;
        // }catch (error){
        //     throw error;
        // }

        const tokens = await loginUser(credentials);

        const currentUser = await getCurrentUser(tokens.access);

        dispatch(
            setCredentials({
                user: currentUser,
                access: tokens.access,
                refresh: tokens.refresh,
            }),
        );

        return currentUser;
        
    };



    const Register = async (credentials) => {
        return registerUser({
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
            confirm_password: credentials.confirm_password,
        });
    };

    const Logout = () => {
        dispatch(logout())
    }


    return {
        user,
        token: accessToken,
        accessToken,
        isAuthenticated,
        Login,
        Register,
        Logout,
    };
}