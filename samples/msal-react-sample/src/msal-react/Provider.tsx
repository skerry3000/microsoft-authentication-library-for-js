import React from "react";

import { PublicClientApplication, Configuration, AuthenticationParameters, TokenResponse, TokenRenewParameters, Account } from "@azure/msal-browser";

const MsalContext = React.createContext<IPublicClientApplication & IProviderState | null>(null);

interface IProviderProps {
    configuration: Configuration
}

interface IProviderState {
    account: Account
}

interface IPublicClientApplication {
    acquireTokenPopup(request: AuthenticationParameters): Promise<TokenResponse>;
    acquireTokenRedirect(request: AuthenticationParameters): void;
    acquireTokenSilent(silentRequest: TokenRenewParameters): Promise<TokenResponse>;
    getAccount(): Account;
    handleRedirectPromise(): Promise<TokenResponse | null>;
    loginPopup(request: AuthenticationParameters): Promise<TokenResponse>;
    loginRedirect(request: AuthenticationParameters): void;
    logout(): void;
    ssoSilent(request: AuthenticationParameters): Promise<TokenResponse>;
}

export class Provider extends React.Component<IProviderProps, IProviderState> {
    private instance: PublicClientApplication;
    private wrappedInstance: IPublicClientApplication;

    constructor(props: any) {
        super(props);

        this.instance = new PublicClientApplication(props.configuration);

        this.wrappedInstance = {
            acquireTokenPopup: this.instance.acquireTokenPopup.bind(this.instance),
            acquireTokenRedirect: this.instance.acquireTokenRedirect.bind(this.instance),
            acquireTokenSilent: this.instance.acquireTokenSilent.bind(this.instance),
            getAccount: this.instance.getAccount.bind(this.instance),
            handleRedirectPromise: this.instance.handleRedirectPromise.bind(this.instance),
            loginPopup: async (request: AuthenticationParameters): Promise<TokenResponse> =>{
                const response = await this.instance.loginPopup.call(this.instance, request);
                const account = this.instance.getAccount.call(this.instance);
                this.setState({
                    account
                });
                return response;
            },
            loginRedirect: this.instance.loginRedirect.bind(this.instance),
            logout: this.instance.logout.bind(this.instance),
            ssoSilent: async (request: AuthenticationParameters): Promise<TokenResponse> =>{
                const response = await this.instance.ssoSilent.call(this.instance, request);
                const account = this.instance.getAccount.call(this.instance);
                this.setState({
                    account
                });
                return response;
            },
        }

        this.state = {
            account: this.instance.getAccount.call(this.instance)
        };
    }


    render() {

        return (
            <MsalContext.Provider value={{
                ...this.wrappedInstance,
                ...this.state
            }}>
                {this.props.children}
            </MsalContext.Provider>
        );
    }
}

export const Consumer = MsalContext.Consumer;