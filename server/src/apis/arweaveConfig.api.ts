import Arweave from "arweave";

export const initArweave = () => {
    const arweave = Arweave.init({
        host: 'localhost',
        port: 1948,
        protocol: 'http',
    });
    return arweave;
};

// Export a singleton instance
export const arweave = initArweave();