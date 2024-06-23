export const login = (userData) => {
    return {
        type: 'SIGN_IN',
        data: userData
    };z
};

export const logoff = () => {
    return {
        type: 'SIGN_OFF'
    }
};