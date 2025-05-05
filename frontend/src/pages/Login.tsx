import { signInWithRedirect } from "aws-amplify/auth"

const Login = () => {
    return (
        <div>
            <h1>Login page</h1>
            <button
                className={`px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700`} 
                onClick={() => { 
                    signInWithRedirect()
                }}
            >
                Login
            </button>
        </div>
    )
}

export default Login