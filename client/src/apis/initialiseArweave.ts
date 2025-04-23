import Arweave from "arweave"

const initialiseArweave = async () => {
    return await Arweave.init({
        host: 'localhost',
        port: 1984,
        protocol: 'http'
    })
}

export const arweave  = initialiseArweave();