import { ApolloError } from '@apollo/client';
import _ from 'lodash';
import * as constants from './constants'; // Adjust the import path to your constants
import { useToast } from "react-native-toast-notifications";

interface GraphQLErrorExtensions {
    code?: string;
}

interface GraphQLError {
    message: string;
    extensions?: GraphQLErrorExtensions;
}

interface HandlerErrorProps {
    logout?: () => void;
}

const handlerError = (props: any, toast: any, error: ApolloError) => {

    if (error.networkError) {
        // Handle network errors
        // message.error('Network error occurred'); // Replace with your own error message

        toast.show("Network error occurred", {
            type: "danger",
            placement: "bottom",
            duration: 4000,
            animationType: "slide-in",
        });

        console.error('Network error:', error.networkError);
        return;
    }

    error.graphQLErrors.forEach((e: GraphQLError) => {
        const code = e.extensions?.code;

        switch (code) {
            case constants.FORCE_LOGOUT: {
                const { logout } = props;
                // message.error('Force logout required'); // Replace with your own error message

                toast.show("Force logout required", {
                    type: "danger",
                    placement: "bottom",
                    duration: 4000,
                    animationType: "slide-in",
                });
                logout && logout();
                break;
            }

            case constants.DATA_NOT_FOUND:
            case constants.UNAUTHENTICATED:
            case constants.ERROR: {
                // message.error(e.message);

                toast.show(e.message, {
                    type: "danger",
                    placement: "bottom",
                    duration: 4000,
                    animationType: "slide-in",
                });
                break;
            }

            case constants.USER_NOT_FOUND:
            case constants.PASSWORD_WRONG:
            case constants.NOT_ENOUGH_BALANCE:
            case constants.EXPIRE_DATE: {
                // message.error('Error: ' + code); // Replace with your own error message

                toast.show('Error: ' + code, {
                    type: "danger",
                    placement: "bottom",
                    duration: 4000,
                    animationType: "slide-in",
                });
                console.log(`Error code: ${code}`);
                break;
            }

            case constants.INTERNAL_SERVER_ERROR: {
                // message.error('Internal server error occurred'); // Replace with your own error message
                toast.show('Internal server error occurred', {
                    type: "danger",
                    placement: "bottom",
                    duration: 4000,
                    animationType: "slide-in",
                });

                break;
            }

            default: {
                // console.error('Unhandled error:', e);
                toast.show(`Unhandled error: ${e}`, {
                    type: "danger",
                    placement: "bottom",
                    duration: 4000,
                    animationType: "slide-in",
                });
            }
        }
    });
};

const extartHandlerError = () =>{

}

export default handlerError;