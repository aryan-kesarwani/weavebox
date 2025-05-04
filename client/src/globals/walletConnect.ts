declare global {
    interface Window {
        permissions : string[];
        appInfo : {
            name : string,
            logo : string,
        };
        gateway : {
            host : string, 
            port : number,
            protocol : string,
        };
    }
}

export {};