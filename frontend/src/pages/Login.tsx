const Login = () => {
    const loginURl = "https://job-tracker-app-744ivu.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=7s2vj2fch4c8flnu5199p2q6in&redirect_uri=https://dcli3b34ssmw2.cloudfront.net/login-redirect"

    return (
        <div>
            <h1>Login page</h1>
            <button
                className={`px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700`} 
                onClick={() => { 
                    window.location.href = loginURl;
                }}
            >
                Login
            </button>
        </div>
    )
}

export default Login