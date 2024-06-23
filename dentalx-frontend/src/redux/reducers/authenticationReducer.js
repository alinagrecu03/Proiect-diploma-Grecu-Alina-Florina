const initialState = {
    data: {
        userid: undefined,
        email: undefined,
        firstname: "",
        lastname: "",
        account: "",
        new_account: false,
        status: false
    }
};

const loggedReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SIGN_IN':
            return {
                ...state,
                data: action.data
            };
        case 'SIGN_OFF':
            return initialState;
        default:
            return state;
    }
};

export default loggedReducer;